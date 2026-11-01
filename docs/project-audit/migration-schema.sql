--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Addresses" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    street text NOT NULL,
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    zip_code character varying(20) NOT NULL,
    country character varying(100) NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Addresses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Addresses_id_seq" OWNED BY public."Addresses".id;


--
-- Name: AttributeValues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AttributeValues" (
    id integer NOT NULL,
    attribute_id integer NOT NULL,
    value character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN "AttributeValues".value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."AttributeValues".value IS 'e.g., Red, 30ml, Matte';


--
-- Name: AttributeValues_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."AttributeValues_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: AttributeValues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."AttributeValues_id_seq" OWNED BY public."AttributeValues".id;


--
-- Name: Attributes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Attributes" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN "Attributes".name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."Attributes".name IS 'e.g., Color, Size, Finish';


--
-- Name: Attributes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Attributes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Attributes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Attributes_id_seq" OWNED BY public."Attributes".id;


--
-- Name: Brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Brands" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Brands_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Brands_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Brands_id_seq" OWNED BY public."Brands".id;


--
-- Name: CampaignProducts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CampaignProducts" (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    product_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    campaign_price numeric(10,2),
    original_price numeric(10,2)
);


--
-- Name: COLUMN "CampaignProducts".campaign_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."CampaignProducts".campaign_price IS 'قیمت ویژه محصول در کمپین (اختیاری)';


--
-- Name: COLUMN "CampaignProducts".original_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public."CampaignProducts".original_price IS 'قیمت اصلی محصول هنگام اضافه شدن به کمپین';


--
-- Name: CampaignProducts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."CampaignProducts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CampaignProducts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."CampaignProducts_id_seq" OWNED BY public."CampaignProducts".id;


--
-- Name: Campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Campaigns" (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    slug character varying(255) NOT NULL,
    banner_image_url character varying(255),
    campaign_type character varying(50) NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    show_countdown boolean DEFAULT false NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    cta_link character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: Campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Campaigns_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Campaigns_id_seq" OWNED BY public."Campaigns".id;


--
-- Name: CartItems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CartItems" (
    id integer NOT NULL,
    cart_id integer NOT NULL,
    quantity integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    variant_id integer NOT NULL
);


--
-- Name: CartItems_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."CartItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CartItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."CartItems_id_seq" OWNED BY public."CartItems".id;


--
-- Name: Carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Carts" (
    id integer NOT NULL,
    user_id integer,
    session_id character varying(255),
    expires_at timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Carts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Carts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Carts_id_seq" OWNED BY public."Carts".id;


--
-- Name: Categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Categories" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    parent_id integer
);


--
-- Name: Categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Categories_id_seq" OWNED BY public."Categories".id;


--
-- Name: CouponBrands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CouponBrands" (
    id integer NOT NULL,
    coupon_id integer NOT NULL,
    brand_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: CouponBrands_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."CouponBrands_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CouponBrands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."CouponBrands_id_seq" OWNED BY public."CouponBrands".id;


--
-- Name: CouponCategories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CouponCategories" (
    id integer NOT NULL,
    coupon_id integer NOT NULL,
    category_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: CouponCategories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."CouponCategories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CouponCategories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."CouponCategories_id_seq" OWNED BY public."CouponCategories".id;


--
-- Name: CouponGroups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CouponGroups" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: CouponGroups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."CouponGroups_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CouponGroups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."CouponGroups_id_seq" OWNED BY public."CouponGroups".id;


--
-- Name: CouponProducts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CouponProducts" (
    id integer NOT NULL,
    coupon_id integer NOT NULL,
    product_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: CouponProducts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."CouponProducts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CouponProducts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."CouponProducts_id_seq" OWNED BY public."CouponProducts".id;


--
-- Name: Coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Coupons" (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    discount_type character varying(50) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    min_amount numeric(10,2) DEFAULT 0 NOT NULL,
    usage_limit integer,
    used_count integer DEFAULT 0 NOT NULL,
    expiry_date date,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_first_purchase_only boolean DEFAULT false NOT NULL,
    is_exclusive boolean DEFAULT false NOT NULL,
    max_usage_per_user integer,
    coupon_group_id integer,
    max_discount_amount numeric(10,2) DEFAULT NULL::numeric
);


--
-- Name: Coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Coupons_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Coupons_id_seq" OWNED BY public."Coupons".id;


--
-- Name: InventoryLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InventoryLogs" (
    id integer NOT NULL,
    product_id integer NOT NULL,
    order_id integer,
    change_type character varying(50) NOT NULL,
    quantity_change integer NOT NULL,
    new_stock_quantity integer NOT NULL,
    old_stock_quantity integer NOT NULL,
    changed_by_user_id integer,
    description text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    variant_id integer NOT NULL
);


--
-- Name: InventoryLogs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."InventoryLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: InventoryLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."InventoryLogs_id_seq" OWNED BY public."InventoryLogs".id;


--
-- Name: OnlineShoppingAdvices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OnlineShoppingAdvices" (
    id integer NOT NULL,
    user_id integer,
    session_id character varying(255),
    chat_text text NOT NULL,
    date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    object text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: OnlineShoppingAdvices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."OnlineShoppingAdvices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OnlineShoppingAdvices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."OnlineShoppingAdvices_id_seq" OWNED BY public."OnlineShoppingAdvices".id;


--
-- Name: OrderHistories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderHistories" (
    id integer NOT NULL,
    order_id integer NOT NULL,
    status character varying(50) NOT NULL,
    changed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    changed_by integer,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: OrderHistories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."OrderHistories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OrderHistories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."OrderHistories_id_seq" OWNED BY public."OrderHistories".id;


--
-- Name: OrderItems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItems" (
    id integer NOT NULL,
    order_id integer NOT NULL,
    quantity integer NOT NULL,
    price_at_purchase numeric(10,2) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    variant_id integer NOT NULL
);


--
-- Name: OrderItems_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."OrderItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OrderItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."OrderItems_id_seq" OWNED BY public."OrderItems".id;


--
-- Name: Orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Orders" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status character varying(50) NOT NULL,
    shipping_address_id integer NOT NULL,
    payment_status character varying(50) NOT NULL,
    coupon_id integer,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    discount_amount numeric(10,2),
    shipping_cost numeric(10,2),
    total_profit_amount numeric(10,2) DEFAULT 0
);


--
-- Name: Orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Orders_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Orders_id_seq" OWNED BY public."Orders".id;


--
-- Name: Payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payments" (
    id integer NOT NULL,
    order_id integer NOT NULL,
    transaction_id character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    method character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    payment_date timestamp with time zone NOT NULL,
    refunded boolean DEFAULT false NOT NULL,
    refund_reason text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Payments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Payments_id_seq" OWNED BY public."Payments".id;


--
-- Name: ProductVariants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductVariants" (
    id integer NOT NULL,
    product_id integer NOT NULL,
    price numeric(10,2),
    stock_quantity integer DEFAULT 0 NOT NULL,
    sku character varying(255),
    image_url character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: ProductVariants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ProductVariants_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ProductVariants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ProductVariants_id_seq" OWNED BY public."ProductVariants".id;


--
-- Name: Products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Products" (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    stock_quantity integer NOT NULL,
    image_url text,
    category_id integer NOT NULL,
    views_count integer DEFAULT 0 NOT NULL,
    sold_count integer DEFAULT 0 NOT NULL,
    slug character varying(255) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    brand_id integer,
    buy_price numeric(10,2) DEFAULT 0,
    campaign_id integer
);


--
-- Name: Products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Products_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Products_id_seq" OWNED BY public."Products".id;


--
-- Name: ProfitLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProfitLogs" (
    id integer NOT NULL,
    order_id integer NOT NULL,
    order_item_id integer,
    product_id integer NOT NULL,
    item_quantity integer NOT NULL,
    sell_price_at_purchase numeric(10,2) NOT NULL,
    buy_price_at_purchase numeric(10,2) NOT NULL,
    profit_per_item numeric(10,2) NOT NULL,
    total_profit_amount numeric(10,2) NOT NULL,
    transaction_date timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: ProfitLogs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ProfitLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ProfitLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ProfitLogs_id_seq" OWNED BY public."ProfitLogs".id;


--
-- Name: Reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Reviews" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Reviews_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Reviews_id_seq" OWNED BY public."Reviews".id;


--
-- Name: Roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Roles" (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Roles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Roles_id_seq" OWNED BY public."Roles".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


--
-- Name: Settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Settings" (
    key character varying(100) NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ShipmentTrackings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ShipmentTrackings" (
    id integer NOT NULL,
    order_id integer NOT NULL,
    provider_name character varying(100) NOT NULL,
    tracking_code character varying(255),
    status character varying(50) DEFAULT 'Pending'::character varying NOT NULL,
    estimated_delivery_date timestamp with time zone,
    last_update_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: ShipmentTrackings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ShipmentTrackings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ShipmentTrackings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ShipmentTrackings_id_seq" OWNED BY public."ShipmentTrackings".id;


--
-- Name: UserCouponUsages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserCouponUsages" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    coupon_id integer NOT NULL,
    usage_count integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: UserCouponUsages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."UserCouponUsages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UserCouponUsages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."UserCouponUsages_id_seq" OWNED BY public."UserCouponUsages".id;


--
-- Name: UserCoupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserCoupons" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    coupon_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: UserCoupons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."UserCoupons_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UserCoupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."UserCoupons_id_seq" OWNED BY public."UserCoupons".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone_number character varying(20),
    role_id integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resetPasswordToken" character varying(255),
    "resetPasswordExpires" timestamp with time zone,
    otp_code character varying(6),
    otp_expires_at timestamp with time zone
);


--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: VariantValues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VariantValues" (
    id integer NOT NULL,
    variant_id integer NOT NULL,
    attribute_value_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: VariantValues_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."VariantValues_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: VariantValues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."VariantValues_id_seq" OWNED BY public."VariantValues".id;


--
-- Name: Addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Addresses" ALTER COLUMN id SET DEFAULT nextval('public."Addresses_id_seq"'::regclass);


--
-- Name: AttributeValues id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttributeValues" ALTER COLUMN id SET DEFAULT nextval('public."AttributeValues_id_seq"'::regclass);


--
-- Name: Attributes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attributes" ALTER COLUMN id SET DEFAULT nextval('public."Attributes_id_seq"'::regclass);


--
-- Name: Brands id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Brands" ALTER COLUMN id SET DEFAULT nextval('public."Brands_id_seq"'::regclass);


--
-- Name: CampaignProducts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CampaignProducts" ALTER COLUMN id SET DEFAULT nextval('public."CampaignProducts_id_seq"'::regclass);


--
-- Name: Campaigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campaigns" ALTER COLUMN id SET DEFAULT nextval('public."Campaigns_id_seq"'::regclass);


--
-- Name: CartItems id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItems" ALTER COLUMN id SET DEFAULT nextval('public."CartItems_id_seq"'::regclass);


--
-- Name: Carts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Carts" ALTER COLUMN id SET DEFAULT nextval('public."Carts_id_seq"'::regclass);


--
-- Name: Categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Categories" ALTER COLUMN id SET DEFAULT nextval('public."Categories_id_seq"'::regclass);


--
-- Name: CouponBrands id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponBrands" ALTER COLUMN id SET DEFAULT nextval('public."CouponBrands_id_seq"'::regclass);


--
-- Name: CouponCategories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponCategories" ALTER COLUMN id SET DEFAULT nextval('public."CouponCategories_id_seq"'::regclass);


--
-- Name: CouponGroups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponGroups" ALTER COLUMN id SET DEFAULT nextval('public."CouponGroups_id_seq"'::regclass);


--
-- Name: CouponProducts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponProducts" ALTER COLUMN id SET DEFAULT nextval('public."CouponProducts_id_seq"'::regclass);


--
-- Name: Coupons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupons" ALTER COLUMN id SET DEFAULT nextval('public."Coupons_id_seq"'::regclass);


--
-- Name: InventoryLogs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryLogs" ALTER COLUMN id SET DEFAULT nextval('public."InventoryLogs_id_seq"'::regclass);


--
-- Name: OnlineShoppingAdvices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OnlineShoppingAdvices" ALTER COLUMN id SET DEFAULT nextval('public."OnlineShoppingAdvices_id_seq"'::regclass);


--
-- Name: OrderHistories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderHistories" ALTER COLUMN id SET DEFAULT nextval('public."OrderHistories_id_seq"'::regclass);


--
-- Name: OrderItems id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems" ALTER COLUMN id SET DEFAULT nextval('public."OrderItems_id_seq"'::regclass);


--
-- Name: Orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders" ALTER COLUMN id SET DEFAULT nextval('public."Orders_id_seq"'::regclass);


--
-- Name: Payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payments" ALTER COLUMN id SET DEFAULT nextval('public."Payments_id_seq"'::regclass);


--
-- Name: ProductVariants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductVariants" ALTER COLUMN id SET DEFAULT nextval('public."ProductVariants_id_seq"'::regclass);


--
-- Name: Products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products" ALTER COLUMN id SET DEFAULT nextval('public."Products_id_seq"'::regclass);


--
-- Name: ProfitLogs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProfitLogs" ALTER COLUMN id SET DEFAULT nextval('public."ProfitLogs_id_seq"'::regclass);


--
-- Name: Reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reviews" ALTER COLUMN id SET DEFAULT nextval('public."Reviews_id_seq"'::regclass);


--
-- Name: Roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Roles" ALTER COLUMN id SET DEFAULT nextval('public."Roles_id_seq"'::regclass);


--
-- Name: ShipmentTrackings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ShipmentTrackings" ALTER COLUMN id SET DEFAULT nextval('public."ShipmentTrackings_id_seq"'::regclass);


--
-- Name: UserCouponUsages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserCouponUsages" ALTER COLUMN id SET DEFAULT nextval('public."UserCouponUsages_id_seq"'::regclass);


--
-- Name: UserCoupons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserCoupons" ALTER COLUMN id SET DEFAULT nextval('public."UserCoupons_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Name: VariantValues id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VariantValues" ALTER COLUMN id SET DEFAULT nextval('public."VariantValues_id_seq"'::regclass);


--
-- Name: Addresses Addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_pkey" PRIMARY KEY (id);


--
-- Name: AttributeValues AttributeValues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttributeValues"
    ADD CONSTRAINT "AttributeValues_pkey" PRIMARY KEY (id);


--
-- Name: Attributes Attributes_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attributes"
    ADD CONSTRAINT "Attributes_name_key" UNIQUE (name);


--
-- Name: Attributes Attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attributes"
    ADD CONSTRAINT "Attributes_pkey" PRIMARY KEY (id);


--
-- Name: Brands Brands_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Brands"
    ADD CONSTRAINT "Brands_name_key" UNIQUE (name);


--
-- Name: Brands Brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Brands"
    ADD CONSTRAINT "Brands_pkey" PRIMARY KEY (id);


--
-- Name: CampaignProducts CampaignProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CampaignProducts"
    ADD CONSTRAINT "CampaignProducts_pkey" PRIMARY KEY (id);


--
-- Name: Campaigns Campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_pkey" PRIMARY KEY (id);


--
-- Name: Campaigns Campaigns_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_slug_key" UNIQUE (slug);


--
-- Name: CartItems CartItems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pkey" PRIMARY KEY (id);


--
-- Name: Carts Carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_pkey" PRIMARY KEY (id);


--
-- Name: Categories Categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_name_key" UNIQUE (name);


--
-- Name: Categories Categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_pkey" PRIMARY KEY (id);


--
-- Name: CouponBrands CouponBrands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponBrands"
    ADD CONSTRAINT "CouponBrands_pkey" PRIMARY KEY (id);


--
-- Name: CouponCategories CouponCategories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponCategories"
    ADD CONSTRAINT "CouponCategories_pkey" PRIMARY KEY (id);


--
-- Name: CouponGroups CouponGroups_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponGroups"
    ADD CONSTRAINT "CouponGroups_name_key" UNIQUE (name);


--
-- Name: CouponGroups CouponGroups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponGroups"
    ADD CONSTRAINT "CouponGroups_pkey" PRIMARY KEY (id);


--
-- Name: CouponProducts CouponProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponProducts"
    ADD CONSTRAINT "CouponProducts_pkey" PRIMARY KEY (id);


--
-- Name: Coupons Coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key" UNIQUE (code);


--
-- Name: Coupons Coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_pkey" PRIMARY KEY (id);


--
-- Name: InventoryLogs InventoryLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryLogs"
    ADD CONSTRAINT "InventoryLogs_pkey" PRIMARY KEY (id);


--
-- Name: OnlineShoppingAdvices OnlineShoppingAdvices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OnlineShoppingAdvices"
    ADD CONSTRAINT "OnlineShoppingAdvices_pkey" PRIMARY KEY (id);


--
-- Name: OrderHistories OrderHistories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderHistories"
    ADD CONSTRAINT "OrderHistories_pkey" PRIMARY KEY (id);


--
-- Name: OrderItems OrderItems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_pkey" PRIMARY KEY (id);


--
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);


--
-- Name: Payments Payments_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_order_id_key" UNIQUE (order_id);


--
-- Name: Payments Payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_pkey" PRIMARY KEY (id);


--
-- Name: Payments Payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_transaction_id_key" UNIQUE (transaction_id);


--
-- Name: ProductVariants ProductVariants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariants ProductVariants_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_sku_key" UNIQUE (sku);


--
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);


--
-- Name: Products Products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_slug_key" UNIQUE (slug);


--
-- Name: ProfitLogs ProfitLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProfitLogs"
    ADD CONSTRAINT "ProfitLogs_pkey" PRIMARY KEY (id);


--
-- Name: Reviews Reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY (id);


--
-- Name: Roles Roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Roles"
    ADD CONSTRAINT "Roles_name_key" UNIQUE (name);


--
-- Name: Roles Roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Roles"
    ADD CONSTRAINT "Roles_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: Settings Settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_pkey" PRIMARY KEY (key);


--
-- Name: ShipmentTrackings ShipmentTrackings_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ShipmentTrackings"
    ADD CONSTRAINT "ShipmentTrackings_order_id_key" UNIQUE (order_id);


--
-- Name: ShipmentTrackings ShipmentTrackings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ShipmentTrackings"
    ADD CONSTRAINT "ShipmentTrackings_pkey" PRIMARY KEY (id);


--
-- Name: ShipmentTrackings ShipmentTrackings_tracking_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ShipmentTrackings"
    ADD CONSTRAINT "ShipmentTrackings_tracking_code_key" UNIQUE (tracking_code);


--
-- Name: UserCouponUsages UserCouponUsages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserCouponUsages"
    ADD CONSTRAINT "UserCouponUsages_pkey" PRIMARY KEY (id);


--
-- Name: UserCoupons UserCoupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserCoupons"
    ADD CONSTRAINT "UserCoupons_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_resetPasswordToken_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_resetPasswordToken_key" UNIQUE ("resetPasswordToken");


--
-- Name: Users Users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key" UNIQUE (username);


--
-- Name: VariantValues VariantValues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VariantValues"
    ADD CONSTRAINT "VariantValues_pkey" PRIMARY KEY (id);


--
-- Name: AttributeValues unique_attribute_value_constraint; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttributeValues"
    ADD CONSTRAINT unique_attribute_value_constraint UNIQUE (attribute_id, value);


--
-- Name: CampaignProducts unique_campaign_product_constraint; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CampaignProducts"
    ADD CONSTRAINT unique_campaign_product_constraint UNIQUE (campaign_id, product_id);


--
-- Name: CouponBrands unique_coupon_brand_constraint; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponBrands"
    ADD CONSTRAINT unique_coupon_brand_constraint UNIQUE (coupon_id, brand_id);


--
-- Name: CouponCategories unique_coupon_category_constraint; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponCategories"
    ADD CONSTRAINT unique_coupon_category_constraint UNIQUE (coupon_id, category_id);


--
-- Name: CouponProducts unique_coupon_product_constraint; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponProducts"
    ADD CONSTRAINT unique_coupon_product_constraint UNIQUE (coupon_id, product_id);


--
-- Name: UserCoupons unique_user_coupon_constraint; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserCoupons"
    ADD CONSTRAINT unique_user_coupon_constraint UNIQUE (user_id, coupon_id);


--
-- Name: UserCouponUsages unique_user_coupon_usage_constraint; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserCouponUsages"
    ADD CONSTRAINT unique_user_coupon_usage_constraint UNIQUE (user_id, coupon_id);


--
-- Name: Reviews unique_user_product_review_constraint; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT unique_user_product_review_constraint UNIQUE (user_id, product_id);


--
-- Name: VariantValues unique_variant_attribute_value_constraint; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VariantValues"
    ADD CONSTRAINT unique_variant_attribute_value_constraint UNIQUE (variant_id, attribute_value_id);


--
-- Name: Addresses Addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AttributeValues AttributeValues_attribute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AttributeValues"
    ADD CONSTRAINT "AttributeValues_attribute_id_fkey" FOREIGN KEY (attribute_id) REFERENCES public."Attributes"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignProducts CampaignProducts_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CampaignProducts"
    ADD CONSTRAINT "CampaignProducts_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public."Campaigns"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignProducts CampaignProducts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CampaignProducts"
    ADD CONSTRAINT "CampaignProducts_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItems CartItems_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES public."Carts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItems CartItems_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_variant_id_fkey" FOREIGN KEY (variant_id) REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Carts Carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Categories Categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public."Categories"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CouponBrands CouponBrands_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponBrands"
    ADD CONSTRAINT "CouponBrands_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES public."Brands"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CouponBrands CouponBrands_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponBrands"
    ADD CONSTRAINT "CouponBrands_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CouponCategories CouponCategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponCategories"
    ADD CONSTRAINT "CouponCategories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public."Categories"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CouponCategories CouponCategories_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponCategories"
    ADD CONSTRAINT "CouponCategories_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CouponProducts CouponProducts_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponProducts"
    ADD CONSTRAINT "CouponProducts_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CouponProducts CouponProducts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponProducts"
    ADD CONSTRAINT "CouponProducts_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Coupons Coupons_coupon_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_coupon_group_id_fkey" FOREIGN KEY (coupon_group_id) REFERENCES public."CouponGroups"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InventoryLogs InventoryLogs_changed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryLogs"
    ADD CONSTRAINT "InventoryLogs_changed_by_user_id_fkey" FOREIGN KEY (changed_by_user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InventoryLogs InventoryLogs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryLogs"
    ADD CONSTRAINT "InventoryLogs_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InventoryLogs InventoryLogs_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryLogs"
    ADD CONSTRAINT "InventoryLogs_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OnlineShoppingAdvices OnlineShoppingAdvices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OnlineShoppingAdvices"
    ADD CONSTRAINT "OnlineShoppingAdvices_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderHistories OrderHistories_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderHistories"
    ADD CONSTRAINT "OrderHistories_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderHistories OrderHistories_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderHistories"
    ADD CONSTRAINT "OrderHistories_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItems OrderItems_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItems OrderItems_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_variant_id_fkey" FOREIGN KEY (variant_id) REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Orders Orders_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Orders Orders_shipping_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_shipping_address_id_fkey" FOREIGN KEY (shipping_address_id) REFERENCES public."Addresses"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Orders Orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payments Payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariants ProductVariants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductVariants"
    ADD CONSTRAINT "ProductVariants_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Products Products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES public."Brands"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Products Products_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public."Campaigns"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Products Products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public."Categories"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProfitLogs ProfitLogs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProfitLogs"
    ADD CONSTRAINT "ProfitLogs_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProfitLogs ProfitLogs_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProfitLogs"
    ADD CONSTRAINT "ProfitLogs_order_item_id_fkey" FOREIGN KEY (order_item_id) REFERENCES public."OrderItems"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProfitLogs ProfitLogs_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProfitLogs"
    ADD CONSTRAINT "ProfitLogs_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reviews Reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reviews Reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ShipmentTrackings ShipmentTrackings_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ShipmentTrackings"
    ADD CONSTRAINT "ShipmentTrackings_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCouponUsages UserCouponUsages_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserCouponUsages"
    ADD CONSTRAINT "UserCouponUsages_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCouponUsages UserCouponUsages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserCouponUsages"
    ADD CONSTRAINT "UserCouponUsages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCoupons UserCoupons_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserCoupons"
    ADD CONSTRAINT "UserCoupons_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCoupons UserCoupons_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserCoupons"
    ADD CONSTRAINT "UserCoupons_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Users Users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public."Roles"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: VariantValues VariantValues_attribute_value_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VariantValues"
    ADD CONSTRAINT "VariantValues_attribute_value_id_fkey" FOREIGN KEY (attribute_value_id) REFERENCES public."AttributeValues"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VariantValues VariantValues_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VariantValues"
    ADD CONSTRAINT "VariantValues_variant_id_fkey" FOREIGN KEY (variant_id) REFERENCES public."ProductVariants"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

