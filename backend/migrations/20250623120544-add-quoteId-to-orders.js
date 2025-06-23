'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔗 Adding quoteId column to Orders table...');
    
    try {
      // Add quoteId column to Orders table
      await queryInterface.addColumn('Orders', 'quoteId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Quotes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });

      // Add index for quoteId for better query performance
      await queryInterface.addIndex('Orders', ['quoteId'], {
        name: 'idx_orders_quote_id'
      });

      console.log('✅ Successfully added quoteId column and index to Orders table');
      console.log('📋 Orders can now be linked to their originating quotes');
      
    } catch (error) {
      console.error('❌ Error adding quoteId column to Orders:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🗑️ Removing quoteId column from Orders table...');
    
    try {
      // Remove index first
      await queryInterface.removeIndex('Orders', 'idx_orders_quote_id');
      console.log('  ✓ Removed index idx_orders_quote_id');
      
      // Remove quoteId column
      await queryInterface.removeColumn('Orders', 'quoteId');
      console.log('  ✓ Removed quoteId column from Orders table');
      
      console.log('✅ Successfully removed quoteId column and index from Orders table');
      
    } catch (error) {
      console.error('❌ Error removing quoteId column from Orders:', error);
      throw error;
    }
  }
};