// Hand-written to match supabase/migrations/20260721111121_init_schema.sql.
// Regenerate with `npx supabase gen types typescript --db-url <connection-string>`
// once Docker/Podman is available locally, to keep this in sync automatically.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "visitor" | "owner" | "agent" | "admin";
export type PropertyPurpose = "sale" | "rent";
export type PropertyStatus =
  | "draft"
  | "pending"
  | "active"
  | "reserved"
  | "sold"
  | "rented"
  | "archived";
export type PropertySource = "admin" | "owner_submission";
export type PropertyType =
  | "apartment"
  | "studio"
  | "villa"
  | "house"
  | "land"
  | "office"
  | "shop"
  | "commercial"
  | "warehouse"
  | "hotel"
  | "parking"
  | "building";
export type FurnishingStatus = "unfurnished" | "semi_furnished" | "furnished";
export type ConstructionCondition =
  | "new"
  | "under_construction"
  | "renovated"
  | "needs_renovation"
  | "old";
export type CertificateStatus = "yes" | "no" | "in_process";
export type InquiryType = "general" | "viewing_request";
export type InquiryStatus = "new" | "contacted" | "qualified" | "closed";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      cities: {
        Row: {
          id: string;
          slug: string;
          name_sq: string;
          name_en: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_sq: string;
          name_en: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cities"]["Insert"]>;
        Relationships: [];
      };
      neighborhoods: {
        Row: {
          id: string;
          city_id: string;
          slug: string;
          name_sq: string;
          name_en: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          city_id: string;
          slug: string;
          name_sq: string;
          name_en: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["neighborhoods"]["Insert"]>;
        Relationships: [];
      };
      residences: {
        Row: {
          id: string;
          neighborhood_id: string;
          slug: string;
          name_sq: string;
          name_en: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          neighborhood_id: string;
          slug: string;
          name_sq: string;
          name_en: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["residences"]["Insert"]>;
        Relationships: [];
      };
      amenities: {
        Row: {
          id: string;
          slug: string;
          name_sq: string;
          name_en: string;
          icon: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name_sq: string;
          name_en: string;
          icon?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["amenities"]["Insert"]>;
        Relationships: [];
      };
      agents: {
        Row: {
          id: string;
          profile_id: string | null;
          slug: string;
          full_name: string;
          title_sq: string | null;
          title_en: string | null;
          bio_sq: string | null;
          bio_en: string | null;
          phone: string | null;
          whatsapp: string | null;
          email: string | null;
          photo_url: string | null;
          license_no: string | null;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          slug: string;
          full_name: string;
          title_sq?: string | null;
          title_en?: string | null;
          bio_sq?: string | null;
          bio_en?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          photo_url?: string | null;
          license_no?: string | null;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>;
        Relationships: [];
      };
      new_developments: {
        Row: {
          id: string;
          slug: string;
          name_sq: string;
          name_en: string | null;
          developer_name: string | null;
          city_id: string | null;
          neighborhood_id: string | null;
          description_sq: string | null;
          description_en: string | null;
          delivery_date: string | null;
          cover_image: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_sq: string;
          name_en?: string | null;
          developer_name?: string | null;
          city_id?: string | null;
          neighborhood_id?: string | null;
          description_sq?: string | null;
          description_en?: string | null;
          delivery_date?: string | null;
          cover_image?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["new_developments"]["Insert"]>;
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          slug: string;
          reference_code: string | null;
          purpose: PropertyPurpose;
          property_type: PropertyType;
          status: PropertyStatus;
          source: PropertySource;
          is_featured: boolean;
          is_exclusive: boolean;
          title_sq: string;
          title_en: string | null;
          description_sq: string | null;
          description_en: string | null;
          price: number;
          currency: string;
          price_period: string | null;
          city_id: string | null;
          neighborhood_id: string | null;
          residence_id: string | null;
          development_id: string | null;
          address_line: string | null;
          lat: number | null;
          lng: number | null;
          gross_area: number | null;
          net_area: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          floor: number | null;
          total_floors: number | null;
          furnishing: FurnishingStatus | null;
          has_elevator: boolean;
          has_parking: boolean;
          construction_condition: ConstructionCondition | null;
          construction_year: number | null;
          certificate_status: CertificateStatus | null;
          agent_id: string | null;
          owner_contact_name: string | null;
          owner_contact_phone: string | null;
          owner_contact_email: string | null;
          submitted_by: string | null;
          views_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          reference_code?: string | null;
          purpose: PropertyPurpose;
          property_type: PropertyType;
          status?: PropertyStatus;
          source?: PropertySource;
          is_featured?: boolean;
          is_exclusive?: boolean;
          title_sq: string;
          title_en?: string | null;
          description_sq?: string | null;
          description_en?: string | null;
          price: number;
          currency?: string;
          price_period?: string | null;
          city_id?: string | null;
          neighborhood_id?: string | null;
          residence_id?: string | null;
          development_id?: string | null;
          address_line?: string | null;
          lat?: number | null;
          lng?: number | null;
          gross_area?: number | null;
          net_area?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          floor?: number | null;
          total_floors?: number | null;
          furnishing?: FurnishingStatus | null;
          has_elevator?: boolean;
          has_parking?: boolean;
          construction_condition?: ConstructionCondition | null;
          construction_year?: number | null;
          certificate_status?: CertificateStatus | null;
          agent_id?: string | null;
          owner_contact_name?: string | null;
          owner_contact_phone?: string | null;
          owner_contact_email?: string | null;
          submitted_by?: string | null;
          views_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
        Relationships: [];
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          url: string;
          sort_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          url: string;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_images"]["Insert"]>;
        Relationships: [];
      };
      property_videos: {
        Row: {
          id: string;
          property_id: string;
          url: string;
          provider: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          url: string;
          provider?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_videos"]["Insert"]>;
        Relationships: [];
      };
      property_floor_plans: {
        Row: {
          id: string;
          property_id: string;
          url: string;
          label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          url: string;
          label?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_floor_plans"]["Insert"]>;
        Relationships: [];
      };
      property_amenities: {
        Row: {
          property_id: string;
          amenity_id: string;
        };
        Insert: {
          property_id: string;
          amenity_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_amenities"]["Insert"]>;
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          property_id: string | null;
          type: InquiryType;
          name: string;
          email: string | null;
          phone: string | null;
          message: string | null;
          preferred_date: string | null;
          preferred_time: string | null;
          status: InquiryStatus;
          assigned_agent_id: string | null;
          internal_notes: string | null;
          follow_up_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id?: string | null;
          type?: InquiryType;
          name: string;
          email?: string | null;
          phone?: string | null;
          message?: string | null;
          preferred_date?: string | null;
          preferred_time?: string | null;
          status?: InquiryStatus;
          assigned_agent_id?: string | null;
          internal_notes?: string | null;
          follow_up_date?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Insert"]>;
        Relationships: [];
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          filters: Json;
          notify: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          filters?: Json;
          notify?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_searches"]["Insert"]>;
        Relationships: [];
      };
      guides: {
        Row: {
          id: string;
          slug: string;
          title_sq: string;
          title_en: string | null;
          content_sq: string | null;
          content_en: string | null;
          cover_image: string | null;
          author_id: string | null;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_sq: string;
          title_en?: string | null;
          content_sq?: string | null;
          content_en?: string | null;
          cover_image?: string | null;
          author_id?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["guides"]["Insert"]>;
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          author_name: string;
          author_role: string | null;
          content_sq: string;
          content_en: string | null;
          avatar_url: string | null;
          rating: number | null;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_name: string;
          author_role?: string | null;
          content_sq: string;
          content_en?: string | null;
          avatar_url?: string | null;
          rating?: number | null;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      current_agent_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
    };
    Enums: {
      user_role: UserRole;
      property_purpose: PropertyPurpose;
      property_status: PropertyStatus;
      property_source: PropertySource;
      property_type: PropertyType;
      furnishing_status: FurnishingStatus;
      construction_condition: ConstructionCondition;
      certificate_status: CertificateStatus;
      inquiry_type: InquiryType;
      inquiry_status: InquiryStatus;
    };
  };
};
