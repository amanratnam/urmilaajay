export type PhotoSubject = "urmila" | "ajay" | "both" | "family" | "friends" | "others";

export interface Photo {
  id: string;            // uuid (also used as the URL slug)
  slug: string;          // == id, kept for route compatibility
  storagePath: string;   // path within the private `photos` bucket
  src: string;           // short-lived signed URL
  caption: string;
  year: number;
  subject: PhotoSubject;
  aspectRatio: number;
  sortOrder: number;
  blurDataURL?: string;
}

export interface Comment {
  id: string;
  photo_id: string;
  author_name: string;
  body: string;
  created_at: string;
  approved: boolean;
}
