export type PhotoSubject = "urmila" | "ajay" | "both" | "family";

export interface Photo {
  id: string;
  slug: string;
  filename: string;
  src: string;
  caption: string;
  year: number;
  date?: string;
  subject: PhotoSubject;
  aspectRatio: number;
  blurDataURL?: string;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
}

export interface Comment {
  id: string;
  photo_id: string;
  author_name: string;
  body: string;
  created_at: string;
  approved: boolean;
}
