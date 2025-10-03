-- Insertar usuarios de prueba
INSERT INTO users_public (id, name, role, base_location, phone, email, reputation_avg, reputation_count) VALUES
('11111111-1111-1111-1111-111111111111', 'Juan Pérez', 'Productor', 'Buenos Aires', '+549112345678', 'juan@example.com', 4.5, 12),
('22222222-2222-2222-2222-222222222222', 'María García', 'Contratista', 'Córdoba', '+549112345679', 'maria@example.com', 4.8, 8),
('33333333-3333-3333-3333-333333333333', 'Carlos López', 'Ambos', 'Santa Fe', '+549112345680', 'carlos@example.com', 4.2, 15),
('44444444-4444-4444-4444-444444444444', 'Ana Martínez', 'Productor', 'La Pampa', '+549112345681', 'ana@example.com', 4.7, 6),
('55555555-5555-5555-5555-555555555555', 'Roberto Silva', 'Contratista', 'Mendoza', '+549112345682', 'roberto@example.com', 4.3, 10);

-- Insertar servicios de prueba
INSERT INTO services (contractor_id, service_type, title, description, location, coverage_area, reference_price_per_ha, images, status) VALUES
('22222222-2222-2222-2222-222222222222', 'siembra', 'Servicio de Siembra Directa', 'Ofrezco servicios de siembra directa con maquinaria moderna. Especializado en soja y maíz.', 'Córdoba', 'Córdoba, Santa Fe, Buenos Aires', 15000, '["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400"]', 'active'),
('55555555-5555-5555-5555-555555555555', 'cosecha', 'Cosecha de Granos', 'Servicio de cosecha con equipos John Deere. Disponible para soja, maíz y trigo.', 'Mendoza', 'Mendoza, San Luis, La Pampa', 18000, '["https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400"]', 'active'),
('33333333-3333-3333-3333-333333333333', 'pulverizacion', 'Pulverización Aérea', 'Pulverización aérea con avión agrícola. Cobertura rápida y eficiente.', 'Santa Fe', 'Santa Fe, Entre Ríos, Buenos Aires', 12000, '["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400"]', 'active'),
('22222222-2222-2222-2222-222222222222', 'fertilizacion', 'Fertilización de Suelos', 'Aplicación de fertilizantes líquidos y sólidos. Análisis de suelo incluido.', 'Córdoba', 'Córdoba, Santiago del Estero', 8000, '["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400"]', 'active');

-- Insertar solicitudes de prueba
INSERT INTO requests (producer_id, service_type, hectares, date_target, free_location, budget_per_ha, notes, status) VALUES
('11111111-1111-1111-1111-111111111111', 'siembra', 50, '2024-03-15', 'Buenos Aires, Partido de Pergamino', 16000, 'Necesito siembra directa para soja. Campo preparado.', 'pending'),
('44444444-4444-4444-4444-444444444444', 'cosecha', 80, '2024-04-01', 'La Pampa, General Pico', 20000, 'Cosecha de maíz. Campo de 80 hectáreas listo para cosechar.', 'pending'),
('11111111-1111-1111-1111-111111111111', 'pulverizacion', 30, '2024-03-20', 'Buenos Aires, Partido de San Antonio de Areco', 15000, 'Pulverización para control de malezas en soja.', 'pending'),
('33333333-3333-3333-3333-333333333333', 'fertilizacion', 60, '2024-03-25', 'Santa Fe, Departamento de San Cristóbal', 10000, 'Fertilización nitrogenada para maíz. Análisis de suelo disponible.', 'pending');

-- Insertar algunas valoraciones de prueba
INSERT INTO ratings (rater_id, rated_user_id, rating, comment) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 5, 'Excelente trabajo en la siembra. Muy profesional y puntual.'),
('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 4, 'Buen servicio de cosecha. Cumplió con los tiempos acordados.'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 5, 'Productor muy responsable. Pago puntual y buena comunicación.'),
('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 4, 'Trabajo bien coordinado. Campo en buenas condiciones.');

