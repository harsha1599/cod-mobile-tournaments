/**
 * Database Service - Database query utilities and helpers
 * Provides reusable methods for common database operations
 */

import { supabase } from '../supabase.js';

class DatabaseService {
  /**
   * Query a table with filters and options
   * @param {string} tableName - Table name
   * @param {object} filters - Filter conditions
   * @param {object} options - Query options (limit, offset, orderBy, etc.)
   * @returns {Promise} Query results
   */
  async query(tableName, filters = {}, options = {}) {
    const {
      limit = 100,
      offset = 0,
      orderBy = 'created_at',
      ascending = false,
    } = options;

    try {
      let query = supabase.from(tableName).select('*');

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      query = query.order(orderBy, { ascending });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Database query error [${tableName}]:`, error);
      throw error;
    }
  }

  /**
   * Get single record by ID
   */
  async getById(tableName, id) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ${tableName} by ID:`, error);
      throw error;
    }
  }

  /**
   * Insert new record
   */
  async insert(tableName, data) {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([data])
        .select();

      if (error) throw error;
      return result[0];
    } catch (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update record
   */
  async update(tableName, id, data) {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select();

      if (error) throw error;
      return result[0];
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete record
   */
  async delete(tableName, id) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Batch insert records
   */
  async batchInsert(tableName, dataArray) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(dataArray)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error batch inserting into ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Count records
   */
  async count(tableName, filters = {}) {
    try {
      let query = supabase.from(tableName).select('id', { count: 'exact', head: true });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });

      const { count, error } = await query;

      if (error) throw error;
      return count;
    } catch (error) {
      console.error(`Error counting ${tableName}:`, error);
      throw error;
    }
  }
}

export default new DatabaseService();
