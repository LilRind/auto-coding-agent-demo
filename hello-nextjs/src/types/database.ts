export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProjectStage = 'draft' | 'scenes' | 'images' | 'videos' | 'completed';
export type ImageStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          story: string;
          style: string;
          stage: ProjectStage;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          story: string;
          style?: string;
          stage?: ProjectStage;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          story?: string;
          style?: string;
          stage?: ProjectStage;
          created_at?: string;
          updated_at?: string;
        };
      };
      scenes: {
        Row: {
          id: string;
          project_id: string;
          order_index: number;
          description: string;
          description_confirmed: boolean;
          image_status: ImageStatus;
          image_confirmed: boolean;
          video_status: VideoStatus;
          video_confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          order_index: number;
          description: string;
          description_confirmed?: boolean;
          image_status?: ImageStatus;
          image_confirmed?: boolean;
          video_status?: VideoStatus;
          video_confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          order_index?: number;
          description?: string;
          description_confirmed?: boolean;
          image_status?: ImageStatus;
          image_confirmed?: boolean;
          video_status?: VideoStatus;
          video_confirmed?: boolean;
          created_at?: string;
        };
      };
      images: {
        Row: {
          id: string;
          scene_id: string;
          storage_path: string;
          url: string;
          width: number | null;
          height: number | null;
          version: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          scene_id: string;
          storage_path: string;
          url: string;
          width?: number | null;
          height?: number | null;
          version?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          scene_id?: string;
          storage_path?: string;
          url?: string;
          width?: number | null;
          height?: number | null;
          version?: number;
          created_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          scene_id: string;
          storage_path: string;
          url: string;
          duration: number | null;
          task_id: string | null;
          version: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          scene_id: string;
          storage_path: string;
          url: string;
          duration?: number | null;
          task_id?: string | null;
          version?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          scene_id?: string;
          storage_path?: string;
          url?: string;
          duration?: number | null;
          task_id?: string | null;
          version?: number;
          created_at?: string;
        };
      };
    };
  };
}

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type Scene = Database['public']['Tables']['scenes']['Row'];
export type SceneInsert = Database['public']['Tables']['scenes']['Insert'];
export type SceneUpdate = Database['public']['Tables']['scenes']['Update'];

export type Image = Database['public']['Tables']['images']['Row'];
export type ImageInsert = Database['public']['Tables']['images']['Insert'];
export type ImageUpdate = Database['public']['Tables']['images']['Update'];

export type Video = Database['public']['Tables']['videos']['Row'];
export type VideoInsert = Database['public']['Tables']['videos']['Insert'];
export type VideoUpdate = Database['public']['Tables']['videos']['Update'];

export interface SceneWithMedia extends Scene {
  images: Image[];
  videos: Video[];
}

export interface ProjectWithScenes extends Project {
  scenes: SceneWithMedia[];
}
