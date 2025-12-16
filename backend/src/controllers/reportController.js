import { Parser as CsvParser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { IncomeCalculation, Trainer, Client, Session, SessionAttendee, Subscription } from '../models/index.js';
import { Op } from 'sequelize';

// Helper: collect trainer report data
const buildTrainerReportData = async ({ trainer_id, date_from, date_to }) => {
  const whereClause = { trainer_id };

  if (date_from && date_to) {
    whereClause.created_at = {
      [Op.between]: [new Date(date_from), new Date(date_to)],
    };
  }

  const trainer = await Trainer.findByPk(trainer_id);
  if (!trainer) return null;

  const incomeRecords = await IncomeCalculation.findAll({
    where: whereClause,
    include: [
      {
        model: Session,
        as: 'session',
        attributes: ['id', 'date_time'],
      },
    ],
    order: [[{ model: Session, as: 'session' }, 'date_time', 'ASC']],
  });

  const rows = incomeRecords.map((rec) => ({
    session_id: rec.session_id,
    date: rec.session?.date_time,
    total_income: parseFloat(rec.total_income),
    income_per_session: parseFloat(rec.income_per_session),
  }));

  const totalIncome = rows.reduce((sum, r) => sum + r.total_income, 0);

  return {
    trainer: {
      id: trainer.id,
      full_name: trainer.full_name,
    },
    period: { from: date_from, to: date_to },
    sessions_count: rows.length,
    total_income: totalIncome,
    rows,
  };
};

// Helper: collect client report data
const buildClientReportData = async ({ client_id, date_from, date_to }) => {
  const client = await Client.findByPk(client_id);
  if (!client) return null;

  const whereClause = {};
  if (date_from && date_to) {
    whereClause.date_time = {
      [Op.between]: [new Date(date_from), new Date(date_to)],
    };
  }

  const sessions = await Session.findAll({
    where: whereClause,
    include: [
      { model: Trainer, as: 'trainer', attributes: ['id, full_name'] },
      {
        model: SessionAttendee,
        as: 'attendees',
        where: { client_id },
        include: [
          { model: Subscription, as: 'subscription', attributes: ['id', 'type', 'status', 'price'] },
        ],
      },
    ],
    order: [['date_time', 'ASC']],
  });

  const rows = sessions.map((s) => ({
    session_id: s.id,
    date: s.date_time,
    trainer: s.trainer?.full_name,
    subscription_type: s.attendees[0]?.subscription?.type,
    subscription_status: s.attendees[0]?.subscription?.status,
    price: s.attendees[0]?.subscription?.price ? parseFloat(s.attendees[0].subscription.price) : null,
  }));

  return {
    client: {
      id: client.id,
      full_name: client.full_name,
      phone_number: client.phone_number,
    },
    period: { from: date_from, to: date_to },
    sessions_count: rows.length,
    rows,
  };
};

// Helper: collect date-based report data (all sessions in date range)
const buildDateReportData = async ({ date_from, date_to }) => {
  const whereClause = {};
  if (date_from && date_to) {
    whereClause.date_time = {
      [Op.between]: [new Date(date_from), new Date(date_to)],
    };
  }

  const sessions = await Session.findAll({
    where: whereClause,
    include: [
      { model: Trainer, as: 'trainer', attributes: ['id', 'full_name'] },
      {
        model: SessionAttendee,
        as: 'attendees',
        include: [
          { model: Client, as: 'client', attributes: ['id', 'full_name'] },
          { model: Subscription, as: 'subscription', attributes: ['id', 'type', 'status', 'price'] },
        ],
      },
    ],
    order: [['date_time', 'ASC']],
  });

  const rows = sessions.map((s) => ({
    session_id: s.id,
    date: s.date_time,
    trainer: s.trainer?.full_name,
    clients_count: s.attendees.length,
    active_clients: s.attendees.filter((a) => a.subscription?.status === 'active').length,
    expired_clients: s.attendees.filter((a) => a.subscription?.status === 'expired').length,
  }));

  return {
    period: { from: date_from, to: date_to },
    sessions_count: rows.length,
    rows,
  };
};

// Helper: generate CSV string from rows
const generateCsv = (rows) => {
  const parser = new CsvParser();
  return parser.parse(rows);
};

// Helper: generate simple HTML table
const generateHtmlTable = (title, rows) => {
  if (!rows.length) {
    return `<html><head><title>${title}</title></head><body><h2>${title}</h2><p>No data</p></body></html>`;
  }

  const columns = Object.keys(rows[0]);
  const headerRow = columns.map((c) => `<th>${c}</th>`).join('');
  const bodyRows = rows
    .map((row) => `<tr>${columns.map((c) => `<td>${row[c] ?? ''}</td>`).join('')}</tr>`)
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; }
    th { background-color: #f3f4f6; text-align: left; }
  </style>
</head>
<body>
  <h2>${title}</h2>
  <table>
    <thead><tr>${headerRow}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
</body>
</html>`;
};

// Helper: generate PDF from rows (basic)
const generatePdfStream = (title, rows) => {
  const doc = new PDFDocument({ margin: 40 });
  const stream = new Readable({ read() {} });

  doc.on('data', (chunk) => stream.push(chunk));
  doc.on('end', () => stream.push(null));

  doc.fontSize(18).text(title, { underline: true });
  doc.moveDown();

  if (!rows.length) {
    doc.fontSize(12).text('No data for selected period.');
    doc.end();
    return stream;
  }

  const columns = Object.keys(rows[0]);

  doc.fontSize(10).text(columns.join(' | '));
  doc.moveDown(0.5);

  rows.forEach((row) => {
    const line = columns.map((c) => String(row[c] ?? '')).join(' | ');
    doc.text(line);
  });

  doc.end();
  return stream;
};

// REPORT TYPE: trainer
export const getTrainerReport = async (req, res) => {
  try {
    const { trainer_id } = req.params;
    const { date_from, date_to, format = 'json' } = req.query;

    const data = await buildTrainerReportData({ trainer_id, date_from, date_to });
    if (!data) {
      return res.status(404).json({
        success: false,
        error: { message: 'Trainer not found', code: 'NOT_FOUND' },
      });
    }

    if (format === 'csv') {
      const csv = generateCsv(data.rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=trainer_${trainer_id}_report.csv`);
      return res.status(200).send(csv);
    }

    if (format === 'html') {
      const html = generateHtmlTable(`Trainer Report: ${data.trainer.full_name}`, data.rows);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    if (format === 'pdf') {
      const pdfStream = generatePdfStream(`Trainer Report: ${data.trainer.full_name}`, data.rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=trainer_${trainer_id}_report.pdf`);
      return pdfStream.pipe(res);
    }

    // Default: JSON
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error generating trainer report:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate trainer report', code: 'REPORT_ERROR' },
    });
  }
};

// REPORT TYPE: client
export const getClientReport = async (req, res) => {
  try {
    const { client_id } = req.params;
    const { date_from, date_to, format = 'json' } = req.query;

    const data = await buildClientReportData({ client_id, date_from, date_to });
    if (!data) {
      return res.status(404).json({
        success: false,
        error: { message: 'Client not found', code: 'NOT_FOUND' },
      });
    }

    if (format === 'csv') {
      const csv = generateCsv(data.rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=client_${client_id}_report.csv`);
      return res.status(200).send(csv);
    }

    if (format === 'html') {
      const html = generateHtmlTable(`Client Report: ${data.client.full_name}`, data.rows);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    if (format === 'pdf') {
      const pdfStream = generatePdfStream(`Client Report: ${data.client.full_name}`, data.rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=client_${client_id}_report.pdf`);
      return pdfStream.pipe(res);
    }

    // JSON default
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error generating client report:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate client report', code: 'REPORT_ERROR' },
    });
  }
};

// REPORT TYPE: date range
export const getDateReport = async (req, res) => {
  try {
    const { date_from, date_to, format = 'json' } = req.query;

    if (!date_from || !date_to) {
      return res.status(400).json({
        success: false,
        error: { message: 'date_from and date_to are required', code: 'VALIDATION_ERROR' },
      });
    }

    const data = await buildDateReportData({ date_from, date_to });

    if (format === 'csv') {
      const csv = generateCsv(data.rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=date_report_${date_from}_${date_to}.csv`);
      return res.status(200).send(csv);
    }

    if (format === 'html') {
      const html = generateHtmlTable(`Date Report: ${date_from} - ${date_to}`, data.rows);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    if (format === 'pdf') {
      const pdfStream = generatePdfStream(`Date Report: ${date_from} - ${date_to}`, data.rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=date_report_${date_from}_${date_to}.pdf`);
      return pdfStream.pipe(res);
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error generating date report:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate date report', code: 'REPORT_ERROR' },
    });
  }
};
