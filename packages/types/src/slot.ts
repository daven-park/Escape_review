export interface AvailableSlot {
  id: string;
  themeId: string;
  date: string;
  time: string;
  isAvailable: boolean;
  price?: number;
}
