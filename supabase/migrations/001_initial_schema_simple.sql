-- Create users_public table
CREATE TABLE users_public (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  role text CHECK (role IN ('Productor','Contratista','Ambos')) DEFAULT 'Productor',
  base_location text,
  phone text,
  avatar_url text,
  reputation_avg numeric DEFAULT 0,
  reputation_count int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Create services table
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES users_public(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  service_type text CHECK (service_type IN ('siembra','cosecha','fumigacion','otros')) NOT NULL,
  coverage_area text, -- zona o radio
  reference_price numeric,
  images jsonb DEFAULT '[]',
  video_url text,
  status text CHECK (status IN ('active','paused','archived')) DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now()
);

-- Create lots table
CREATE TABLE lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users_public(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL,
  surface_total_ha numeric,
  created_at timestamp with time zone DEFAULT now()
);

-- Create requests table
CREATE TABLE requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id uuid REFERENCES users_public(id) ON DELETE CASCADE,
  contractor_id uuid REFERENCES users_public(id), -- opcional
  service_id uuid REFERENCES services(id),       -- opcional
  service_type text CHECK (service_type IN ('siembra','cosecha','fumigacion','otros')) NOT NULL,
  hectares numeric NOT NULL,
  date_target date NOT NULL,
  lot_id uuid REFERENCES lots(id),
  free_location text,
  status text CHECK (status IN ('pending','accepted','rejected','closed')) DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id uuid REFERENCES users_public(id) ON DELETE CASCADE,
  to_id uuid REFERENCES users_public(id) ON DELETE CASCADE,
  body text NOT NULL,
  request_id uuid REFERENCES requests(id),
  service_id uuid REFERENCES services(id),
  sent_at timestamp with time zone DEFAULT now()
);

-- Create ratings table
CREATE TABLE ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES users_public(id) ON DELETE CASCADE,
  target_id uuid REFERENCES users_public(id) ON DELETE CASCADE,
  stars int CHECK (stars BETWEEN 1 AND 5) NOT NULL,
  comment text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users_public ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_public
CREATE POLICY "Users can view their own profile" ON users_public
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users_public
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users_public
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by authenticated users" ON users_public
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for services
CREATE POLICY "Services are viewable by authenticated users" ON services
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Contractors can manage their own services" ON services
  FOR ALL USING (auth.uid() = contractor_id);

-- RLS Policies for lots
CREATE POLICY "Lot owners can manage their own lots" ON lots
  FOR ALL USING (auth.uid() = owner_id);

-- RLS Policies for requests
CREATE POLICY "Producers can create requests" ON requests
  FOR INSERT WITH CHECK (auth.uid() = producer_id);

CREATE POLICY "Request participants can view requests" ON requests
  FOR SELECT USING (
    auth.uid() = producer_id OR 
    auth.uid() = contractor_id OR
    (contractor_id IS NULL AND status = 'pending')
  );

CREATE POLICY "Producers can update their own requests" ON requests
  FOR UPDATE USING (auth.uid() = producer_id);

CREATE POLICY "Contractors can accept/reject requests" ON requests
  FOR UPDATE USING (auth.uid() = contractor_id);

-- RLS Policies for messages
CREATE POLICY "Message participants can view messages" ON messages
  FOR SELECT USING (auth.uid() = from_id OR auth.uid() = to_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = from_id);

-- RLS Policies for ratings
CREATE POLICY "Users can view ratings" ON ratings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Function to update reputation
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users_public 
  SET 
    reputation_avg = (
      SELECT AVG(stars)::numeric(3,2) 
      FROM ratings 
      WHERE target_id = NEW.target_id
    ),
    reputation_count = (
      SELECT COUNT(*) 
      FROM ratings 
      WHERE target_id = NEW.target_id
    )
  WHERE id = NEW.target_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update reputation when rating is inserted
CREATE TRIGGER update_reputation_trigger
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_reputation();
