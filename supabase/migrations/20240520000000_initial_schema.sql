-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'TENANT_ADMIN', 'CUSTOMER', 'ADMIN_PLATFORM');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'PAID');

-- 2. Create public.users table (linked to auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    role user_role DEFAULT 'CUSTOMER'::user_role,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create properties (kosan) table
CREATE TABLE public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create rooms table
CREATE TABLE public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    room_number TEXT NOT NULL,
    price_per_month DECIMAL(12, 2) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    facilities TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create bookings table
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    total_price DECIMAL(12, 2) NOT NULL,
    status booking_status DEFAULT 'PENDING'::booking_status,
    payment_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SQL Trigger for auth.users to public.users synchronization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'CUSTOMER'::public.user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Row-Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies for public.users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policies for properties
CREATE POLICY "Anyone can view properties" ON public.properties
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage their properties" ON public.properties
  FOR ALL USING (auth.uid() = owner_id);

-- Policies for rooms
CREATE POLICY "Anyone can view rooms" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage rooms of their properties" ON public.rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = rooms.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Policies for bookings
CREATE POLICY "Customers can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Owners can view bookings of their rooms" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      JOIN public.properties ON rooms.property_id = properties.id
      WHERE rooms.id = bookings.room_id
      AND properties.owner_id = auth.uid()
    )
  );
