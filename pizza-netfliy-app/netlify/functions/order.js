exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { items, cartValue, address, name, phone } = body;

    // Validate the 5 required fields
    if (!items || !cartValue || !address || !name || !phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: 'REJECTED',
          message: 'Missing required order details.',
        }),
      };
    }

    // 1. Time Validation: 11:00 AM to 2:00 AM IST
    const timeZone = 'Asia/Kolkata';
    const localHour = parseInt(
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone,
      }).format(new Date()),
      10
    );

    const isWithinOperatingHours = localHour >= 11 || localHour < 2;

    if (!isWithinOperatingHours) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: 'REJECTED',
          message: 'Orders are only accepted between 11:00 AM and 2:00 AM IST.',
        }),
      };
    }

    // 2. Serviceable Location Validation
    const serviceableKeywords = [
      'indiranagar', '100 feet road', '560038',
      'koramangala', '5th block', '560095',
      'hsr', 'hsr layout', '27th main road', '560102'
    ];

    const fullAddressLower = String(address).toLowerCase();

    // Checks if the full address string contains any serviceable locality or pincode
    const isServiceable = serviceableKeywords.some((keyword) =>
      fullAddressLower.includes(keyword)
    );

    if (!isServiceable) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: 'REJECTED',
          message: 'Location is not serviceable or out of delivery zone.',
        }),
      };
    }

    // Success (200 OK)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'ACCEPTED',
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        message: 'Order accepted successfully.',
        receivedDetails: {
          items,
          cartValue,
          address,
          name,
          phone,
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'ERROR', message: 'Invalid JSON payload.' }),
    };
  }
};