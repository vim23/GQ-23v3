export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      report: {
        Row: {
          addressData: Json
          catcode: string
          category: string | null
          geoJsonData: Json | null
          location: unknown | null
          repdt: string
          repid: string
          repimg: string | null
          replaty: number | null
          reploc: string | null
          replonx: number | null
          report: string | null
          reporter: string | null
          reppoint: string | null
          repserial: string
          subcat: string | null
        }
        Insert: {
          addressData: Json
          catcode: string
          category?: string | null
          geoJsonData?: Json | null
          location?: unknown | null
          repdt?: string
          repid: string
          repimg?: string | null
          replaty?: number | null
          reploc?: string | null
          replonx?: number | null
          report?: string | null
          reporter?: string | null
          reppoint?: string | null
          repserial: string
          subcat?: string | null
        }
        Update: {
          addressData?: Json
          catcode?: string
          category?: string | null
          geoJsonData?: Json | null
          location?: unknown | null
          repdt?: string
          repid?: string
          repimg?: string | null
          replaty?: number | null
          reploc?: string | null
          replonx?: number | null
          report?: string | null
          reporter?: string | null
          reppoint?: string | null
          repserial?: string
          subcat?: string | null
        }
      }
      update: {
        Row: {
          resolved: boolean
          update: string | null
          updater: string | null
          updt: string
          upid: string | null
          upimg: string | null
          uprepid: string
          upserial: string | null
          upserial_: number
          upuuid: string
        }
        Insert: {
          resolved: boolean
          update?: string | null
          updater?: string | null
          updt?: string
          upid?: string | null
          upimg?: string | null
          uprepid: string
          upserial?: string | null
          upserial_?: number
          upuuid?: string
        }
        Update: {
          resolved?: boolean
          update?: string | null
          updater?: string | null
          updt?: string
          upid?: string | null
          upimg?: string | null
          uprepid?: string
          upserial?: string | null
          upserial_?: number
          upuuid?: string
        }
      }
      user: {
        Row: {
          avatar: string | null
          created_at: string
          email: string | null
          id: string
          username: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          id: string
          username?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: string
          username?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reports_in_view: {
        Args: {
          min_lat: number
          min_long: number
          max_lat: number
          max_long: number
          name: string
        }
        Returns: Record<string, unknown>[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
