export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string | 'present';
  highlights: string[];
}
