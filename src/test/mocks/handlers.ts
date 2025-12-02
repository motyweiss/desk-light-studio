import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8123/api';

// Mock Home Assistant API responses
export const handlers = [
  // Get states
  http.get(`${BASE_URL}/states/:entity_id`, ({ params }) => {
    const { entity_id } = params;

    // Mock light states
    if (entity_id === 'light.go') {
      return HttpResponse.json({
        entity_id: 'light.go',
        state: 'on',
        attributes: {
          brightness: 200,
          friendly_name: 'Desk Lamp',
        },
      });
    }

    if (entity_id === 'light.screen') {
      return HttpResponse.json({
        entity_id: 'light.screen',
        state: 'on',
        attributes: {
          brightness: 150,
          friendly_name: 'Monitor Light',
        },
      });
    }

    if (entity_id === 'light.door') {
      return HttpResponse.json({
        entity_id: 'light.door',
        state: 'off',
        attributes: {
          brightness: 0,
          friendly_name: 'Spotlight',
        },
      });
    }

    // Mock sensor states
    if (entity_id === 'sensor.dyson_pure_temperature') {
      return HttpResponse.json({
        entity_id: 'sensor.dyson_pure_temperature',
        state: '22.5',
        attributes: {
          unit_of_measurement: '°C',
          friendly_name: 'Temperature',
        },
      });
    }

    if (entity_id === 'sensor.dyson_pure_humidity') {
      return HttpResponse.json({
        entity_id: 'sensor.dyson_pure_humidity',
        state: '45',
        attributes: {
          unit_of_measurement: '%',
          friendly_name: 'Humidity',
        },
      });
    }

    if (entity_id === 'sensor.dyson_pure_pm_2_5') {
      return HttpResponse.json({
        entity_id: 'sensor.dyson_pure_pm_2_5',
        state: '8',
        attributes: {
          unit_of_measurement: 'µg/m³',
          friendly_name: 'Air Quality',
        },
      });
    }

    // Mock battery sensors
    if (entity_id === 'sensor.motys_iphone_battery_level') {
      return HttpResponse.json({
        entity_id: 'sensor.motys_iphone_battery_level',
        state: '85',
        attributes: {
          unit_of_measurement: '%',
          friendly_name: "Moty's iPhone Battery",
        },
      });
    }

    if (entity_id === 'sensor.motys_iphone_battery_state') {
      return HttpResponse.json({
        entity_id: 'sensor.motys_iphone_battery_state',
        state: 'Not Charging',
        attributes: {
          friendly_name: "Moty's iPhone Battery State",
        },
      });
    }

    // Mock media player
    if (entity_id === 'media_player.spotify') {
      return HttpResponse.json({
        entity_id: 'media_player.spotify',
        state: 'playing',
        attributes: {
          media_title: 'Bohemian Rhapsody',
          media_artist: 'Queen',
          media_album_name: 'A Night at the Opera',
          media_content_type: 'music',
          volume_level: 0.5,
          is_volume_muted: false,
          media_position: 120,
          media_duration: 354,
          media_position_updated_at: new Date().toISOString(),
          shuffle: false,
          repeat: 'off',
          source: 'Spotify',
          source_list: ["Moty's MacBook Air", 'Living Room Speaker'],
          entity_picture: '/api/media_player_proxy/media_player.spotify?token=mock',
          friendly_name: 'Spotify',
        },
      });
    }

    return HttpResponse.json({ error: 'Entity not found' }, { status: 404 });
  }),

  // Set light brightness
  http.post(`${BASE_URL}/services/light/turn_on`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true, data: body });
  }),

  // Turn off light
  http.post(`${BASE_URL}/services/light/turn_off`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true, data: body });
  }),

  // Media player controls
  http.post(`${BASE_URL}/services/media_player/:action`, async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true, action: params.action, data: body });
  }),

  // Get all states
  http.get(`${BASE_URL}/states`, () => {
    return HttpResponse.json([
      {
        entity_id: 'light.go',
        state: 'on',
        attributes: { brightness: 200, friendly_name: 'Desk Lamp' },
      },
      {
        entity_id: 'light.screen',
        state: 'on',
        attributes: { brightness: 150, friendly_name: 'Monitor Light' },
      },
      {
        entity_id: 'light.door',
        state: 'off',
        attributes: { brightness: 0, friendly_name: 'Spotlight' },
      },
    ]);
  }),
];
