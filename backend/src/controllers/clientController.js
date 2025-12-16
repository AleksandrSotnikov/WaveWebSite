import { Client, Subscription } from '../models/index.js';

// Get all clients
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      include: [{ association: 'subscriptions', attributes: ['id', 'type', 'status', 'expiration_date'] }],
    });

    res.status(200).json({
      success: true,
      data: clients,
      total: clients.length,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch clients', code: 'FETCH_ERROR' },
    });
  }
};

// Get client by ID
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id, {
      include: [{ association: 'subscriptions' }],
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: { message: 'Client not found', code: 'NOT_FOUND' },
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch client', code: 'FETCH_ERROR' },
    });
  }
};

// Create client
export const createClient = async (req, res) => {
  try {
    const { full_name, phone_number, messenger_link } = req.body;

    // Validate required fields
    if (!full_name || !phone_number) {
      return res.status(400).json({
        success: false,
        error: { message: 'full_name and phone_number are required', code: 'VALIDATION_ERROR' },
      });
    }

    // Validate phone format
    if (!/^\+7\d{10}$/.test(phone_number)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Phone must be in format +7XXXXXXXXXX', code: 'INVALID_PHONE' },
      });
    }

    // Check for duplicate phone
    const existingClient = await Client.findOne({ where: { phone_number } });
    if (existingClient) {
      return res.status(409).json({
        success: false,
        error: { message: 'Client with this phone number already exists', code: 'DUPLICATE_PHONE' },
      });
    }

    const newClient = await Client.create({
      full_name,
      phone_number,
      messenger_link,
    });

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: newClient,
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create client', code: 'CREATE_ERROR' },
    });
  }
};

// Update client
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone_number, messenger_link } = req.body;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: { message: 'Client not found', code: 'NOT_FOUND' },
      });
    }

    // Validate phone if provided
    if (phone_number && !/^\+7\d{10}$/.test(phone_number)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Phone must be in format +7XXXXXXXXXX', code: 'INVALID_PHONE' },
      });
    }

    // Check for duplicate phone if changing
    if (phone_number && phone_number !== client.phone_number) {
      const duplicate = await Client.findOne({ where: { phone_number } });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: { message: 'This phone number is already in use', code: 'DUPLICATE_PHONE' },
        });
      }
    }

    await client.update({
      full_name: full_name || client.full_name,
      phone_number: phone_number || client.phone_number,
      messenger_link: messenger_link || client.messenger_link,
    });

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client,
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update client', code: 'UPDATE_ERROR' },
    });
  }
};

// Delete client
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: { message: 'Client not found', code: 'NOT_FOUND' },
      });
    }

    // Check if client has active subscriptions
    const activeSubscriptions = await Subscription.count({
      where: { client_id: id, status: 'active' },
    });

    if (activeSubscriptions > 0) {
      return res.status(409).json({
        success: false,
        error: { message: 'Cannot delete client with active subscriptions', code: 'HAS_ACTIVE_SUBSCRIPTIONS' },
      });
    }

    await client.destroy();

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete client', code: 'DELETE_ERROR' },
    });
  }
};
