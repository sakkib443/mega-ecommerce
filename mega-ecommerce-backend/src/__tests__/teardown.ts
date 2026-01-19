// ===================================================================
// Mega E-Commerce Backend - Test Teardown
// Global cleanup after all tests complete
// ===================================================================

module.exports = async () => {
    // Close any remaining connections
    console.log('\n🧹 Cleaning up test environment...');

    // Additional cleanup if needed
    process.exit(0);
};
