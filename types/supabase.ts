export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          price: number
          location: string
          property_type: string
          bedrooms: number
          bathrooms: number
          area: number
          developer_id: string
          developer_phone: string | null
          images: string[]
          status: string
          amenities: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          price: number
          location: string
          property_type: string
          bedrooms: number
          bathrooms: number
          area: number
          developer_id: string
          developer_phone?: string | null
          images: string[]
          status?: string
          amenities: string[]
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          price?: number
          location?: string
          property_type?: string
          bedrooms?: number
          bathrooms?: number
          area?: number
          developer_id?: string
          developer_phone?: string | null
          images?: string[]
          status?: string
          amenities?: string[]
        }
      }
      developers: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          phone: string
          description: string | null
          logo_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          phone: string
          description?: string | null
          logo_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          phone?: string
          description?: string | null
          logo_url?: string | null
        }
      }
      saved_projects: {
        Row: {
          id: string
          created_at: string
          user_id: string
          project_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          project_id: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          project_id?: string
        }
      }
      enquiries: {
        Row: {
          id: string
          created_at: string
          project_id: string
          user_id: string | null
          name: string
          phone: string
          message: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          user_id?: string | null
          name: string
          phone: string
          message: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          user_id?: string | null
          name?: string
          phone?: string
          message?: string
          status?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 