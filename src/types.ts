/**
 * Types definition for Mini Bazaar (ميني بازار) Luxury E-Commerce
 */

export type AvailabilityStatus = 'available' | 'out_of_stock' | 'hidden';

export interface Category {
  id: string;
  parent_id?: string | null;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar: string;
  description_en: string;
  image_path: string;
  sort_order: number;
  is_active: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name_ar: string;
  name_en: string;
  sku: string;
  price: number;
  compare_at_price?: number;
  availability_status: AvailabilityStatus;
  availability_note?: string;
  is_default: boolean;
  sort_order: number;
  image_path?: string;
  color_code?: string;
  attribute_type?: 'color' | 'size' | 'volume' | 'style';
}

export interface ProductImage {
  id: string;
  product_id: string;
  product_variant_id?: string | null;
  path: string;
  alt_text_ar: string;
  alt_text_en: string;
  sort_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  sku: string;
  short_description_ar: string;
  short_description_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  compare_at_price?: number;
  availability_status: AvailabilityStatus;
  availability_note_ar?: string;
  availability_note_en?: string;
  is_featured: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  sort_order: number;
  rating: number;
  reviews_count: number;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface DeliveryMethod {
  id: string;
  name_ar: string;
  name_en: string;
  description: string;
  fee: number;
  city_group: string;
  is_active: boolean;
  sort_order: number;
}

export type PaymentMethodType = 'bank_transfer' | 'cash_on_delivery' | 'store_pickup';

export interface BankAccountDetails {
  bank_name: string;
  iban: string;
  account_name: string;
  account_number: string;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name_ar: string;
  name_en: string;
  instructions: string;
  is_active: boolean;
  sort_order: number;
  bank_details?: BankAccountDetails;
}

export type OrderStatus =
  | 'new'
  | 'contacted'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItemSnapshot {
  product_id: string;
  variant_id?: string;
  product_name_snapshot: string;
  variant_name_snapshot?: string;
  sku_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  image_snapshot?: string;
}

export interface OrderStatusLog {
  id: string;
  order_id: string;
  from_status: OrderStatus;
  to_status: OrderStatus;
  note: string;
  changed_by: string;
  created_at: string;
}

export interface CustomerAddress {
  country: string;
  city: string;
  district: string;
  street: string;
  building?: string;
  postal_code?: string;
  additional_details?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  customer_email_snapshot?: string;
  address_snapshot: CustomerAddress;
  subtotal: number;
  delivery_fee: number;
  discount_total: number;
  grand_total: number;
  delivery_method_snapshot: DeliveryMethod;
  payment_method_snapshot: PaymentMethod;
  status: OrderStatus;
  customer_notes?: string;
  admin_notes?: string;
  source: 'web' | 'whatsapp';
  placed_at: string;
  items: OrderItemSnapshot[];
  logs: OrderStatusLog[];
}

export interface HeroSlide {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  badge_ar?: string;
  badge_en?: string;
  desktop_image: string;
  mobile_image: string;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  text_alignment: 'right' | 'center' | 'left';
  background_type: 'color' | 'image' | 'gradient';
  background_value: string;
  background_image?: string;
  title_color?: string;
  description_color?: string;
  badge_color?: string;
  badge_bg?: string;
  button_bg?: string;
  button_text_color?: string;
  secondary_button_bg?: string;
  secondary_button_text_color?: string;
  pulse_animation?: boolean;
  is_visible: boolean;
  sort_order: number;
}

export interface StoreSettings {
  store_name_ar: string;
  store_name_en: string;
  tagline_ar: string;
  tagline_en: string;
  announcement_bar_text_ar: string;
  announcement_bar_text_en: string;
  announcement_bar_visible: boolean;
  phone_number: string;
  whatsapp_number: string;
  support_email: string;
  boutique_address_ar: string;
  boutique_address_en: string;
  currency: string;
  currency_ar: string;
  custom_logo_url?: string;
  instagram_url?: string;
  snapchat_url?: string;
  tiktok_url?: string;

  // WhatsApp & Communications
  whatsapp_default_message?: string;
  whatsapp_tooltip_badge_text?: string;
  whatsapp_tooltip_enabled?: boolean;
  whatsapp_button_hover_text?: string;
  service_hours_ar?: string;

  // Social Links
  social_links?: SocialLink[];

  // Navigation Menu Items
  navigation_items?: NavigationItem[];

  // Footer Settings
  footer_bio_ar?: string;
  footer_verification_text_ar?: string;
  footer_copyright_ar?: string;
  footer_designer_credit_ar?: string;
  footer_show_designer_credit?: boolean;
  footer_columns?: FooterColumn[];
  footer_payment_methods?: string[];
}

export type SocialPlatform =
  | 'instagram'
  | 'tiktok'
  | 'snapchat'
  | 'twitter'
  | 'facebook'
  | 'youtube'
  | 'whatsapp'
  | 'telegram'
  | 'linkedin'
  | 'pinterest'
  | 'custom';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  title_ar: string;
  url: string;
  is_active: boolean;
  sort_order: number;
}

export type NavigationItemType = 'home' | 'category' | 'offers' | 'custom';

export interface NavigationItem {
  id: string;
  title_ar: string;
  type: NavigationItemType;
  category_id?: string;
  url?: string;
  badge?: string;
  is_active: boolean;
  sort_order: number;
}

export interface FooterBullet {
  id: string;
  text_ar: string;
}

export interface FooterLink {
  id: string;
  title_ar: string;
  url?: string;
  action_type?: 'category' | 'policy' | 'admin' | 'custom';
  target_id?: string;
}

export interface FooterColumn {
  id: string;
  title_ar: string;
  type: 'categories' | 'links' | 'bullets';
  links?: FooterLink[];
  bullets?: FooterBullet[];
  is_active: boolean;
  sort_order: number;
}

export interface ThemeSettings {
  primary_gold: string;
  taupe_strong: string;
  bg_color: string;
  surface_color: string;
  border_radius_card: number;
  carousel_autoplay: boolean;
  carousel_interval: number;
  hero_pulse_animation?: boolean;
}

export interface PageSection {
  id: string;
  type: string;
  title_ar: string;
  is_visible: boolean;
  sort_order: number;
}
