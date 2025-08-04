--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: Addresses; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Addresses" OWNER TO postgres;

--
-- Name: Addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Addresses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Addresses_id_seq" OWNER TO postgres;

--
-- Name: Addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Addresses_id_seq" OWNED BY public."Addresses".id;


--
-- Name: Brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Brands" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Brands" OWNER TO postgres;

--
-- Name: Brands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Brands_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Brands_id_seq" OWNER TO postgres;

--
-- Name: Brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Brands_id_seq" OWNED BY public."Brands".id;


--
-- Name: CampaignProducts; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."CampaignProducts" OWNER TO postgres;

--
-- Name: COLUMN "CampaignProducts".campaign_price; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."CampaignProducts".campaign_price IS 'قیمت ویژه محصول در کمپین (اختیاری)';


--
-- Name: COLUMN "CampaignProducts".original_price; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."CampaignProducts".original_price IS 'قیمت اصلی محصول هنگام اضافه شدن به کمپین';


--
-- Name: CampaignProducts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CampaignProducts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CampaignProducts_id_seq" OWNER TO postgres;

--
-- Name: CampaignProducts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CampaignProducts_id_seq" OWNED BY public."CampaignProducts".id;


--
-- Name: Campaigns; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Campaigns" OWNER TO postgres;

--
-- Name: Campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Campaigns_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Campaigns_id_seq" OWNER TO postgres;

--
-- Name: Campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Campaigns_id_seq" OWNED BY public."Campaigns".id;


--
-- Name: CartItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItems" (
    id integer NOT NULL,
    cart_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CartItems" OWNER TO postgres;

--
-- Name: CartItems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CartItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CartItems_id_seq" OWNER TO postgres;

--
-- Name: CartItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CartItems_id_seq" OWNED BY public."CartItems".id;


--
-- Name: Carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Carts" (
    id integer NOT NULL,
    user_id integer,
    session_id character varying(255),
    expires_at timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Carts" OWNER TO postgres;

--
-- Name: Carts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Carts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Carts_id_seq" OWNER TO postgres;

--
-- Name: Carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Carts_id_seq" OWNED BY public."Carts".id;


--
-- Name: Categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Categories" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    parent_id integer
);


ALTER TABLE public."Categories" OWNER TO postgres;

--
-- Name: Categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Categories_id_seq" OWNER TO postgres;

--
-- Name: Categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Categories_id_seq" OWNED BY public."Categories".id;


--
-- Name: CouponCategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CouponCategories" (
    id integer NOT NULL,
    coupon_id integer NOT NULL,
    category_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CouponCategories" OWNER TO postgres;

--
-- Name: CouponCategories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CouponCategories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CouponCategories_id_seq" OWNER TO postgres;

--
-- Name: CouponCategories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CouponCategories_id_seq" OWNED BY public."CouponCategories".id;


--
-- Name: CouponGroups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CouponGroups" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CouponGroups" OWNER TO postgres;

--
-- Name: CouponGroups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CouponGroups_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CouponGroups_id_seq" OWNER TO postgres;

--
-- Name: CouponGroups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CouponGroups_id_seq" OWNED BY public."CouponGroups".id;


--
-- Name: CouponProducts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CouponProducts" (
    id integer NOT NULL,
    coupon_id integer NOT NULL,
    product_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."CouponProducts" OWNER TO postgres;

--
-- Name: CouponProducts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CouponProducts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CouponProducts_id_seq" OWNER TO postgres;

--
-- Name: CouponProducts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CouponProducts_id_seq" OWNED BY public."CouponProducts".id;


--
-- Name: Coupons; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Coupons" OWNER TO postgres;

--
-- Name: Coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Coupons_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Coupons_id_seq" OWNER TO postgres;

--
-- Name: Coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Coupons_id_seq" OWNED BY public."Coupons".id;


--
-- Name: InventoryLogs; Type: TABLE; Schema: public; Owner: postgres
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
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InventoryLogs" OWNER TO postgres;

--
-- Name: InventoryLogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."InventoryLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."InventoryLogs_id_seq" OWNER TO postgres;

--
-- Name: InventoryLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."InventoryLogs_id_seq" OWNED BY public."InventoryLogs".id;


--
-- Name: OnlineShoppingAdvices; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."OnlineShoppingAdvices" OWNER TO postgres;

--
-- Name: OnlineShoppingAdvices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OnlineShoppingAdvices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OnlineShoppingAdvices_id_seq" OWNER TO postgres;

--
-- Name: OnlineShoppingAdvices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OnlineShoppingAdvices_id_seq" OWNED BY public."OnlineShoppingAdvices".id;


--
-- Name: OrderHistories; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."OrderHistories" OWNER TO postgres;

--
-- Name: OrderHistories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OrderHistories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OrderHistories_id_seq" OWNER TO postgres;

--
-- Name: OrderHistories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrderHistories_id_seq" OWNED BY public."OrderHistories".id;


--
-- Name: OrderItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItems" (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price_at_purchase numeric(10,2) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderItems" OWNER TO postgres;

--
-- Name: OrderItems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OrderItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OrderItems_id_seq" OWNER TO postgres;

--
-- Name: OrderItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrderItems_id_seq" OWNED BY public."OrderItems".id;


--
-- Name: Orders; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Orders" OWNER TO postgres;

--
-- Name: Orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Orders_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Orders_id_seq" OWNER TO postgres;

--
-- Name: Orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Orders_id_seq" OWNED BY public."Orders".id;


--
-- Name: Payments; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Payments" OWNER TO postgres;

--
-- Name: Payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Payments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Payments_id_seq" OWNER TO postgres;

--
-- Name: Payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Payments_id_seq" OWNED BY public."Payments".id;


--
-- Name: Products; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Products" OWNER TO postgres;

--
-- Name: Products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Products_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Products_id_seq" OWNER TO postgres;

--
-- Name: Products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Products_id_seq" OWNED BY public."Products".id;


--
-- Name: ProfitLogs; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."ProfitLogs" OWNER TO postgres;

--
-- Name: ProfitLogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ProfitLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProfitLogs_id_seq" OWNER TO postgres;

--
-- Name: ProfitLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ProfitLogs_id_seq" OWNED BY public."ProfitLogs".id;


--
-- Name: Reviews; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Reviews" OWNER TO postgres;

--
-- Name: Reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Reviews_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Reviews_id_seq" OWNER TO postgres;

--
-- Name: Reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Reviews_id_seq" OWNED BY public."Reviews".id;


--
-- Name: Roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Roles" (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Roles" OWNER TO postgres;

--
-- Name: Roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Roles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Roles_id_seq" OWNER TO postgres;

--
-- Name: Roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Roles_id_seq" OWNED BY public."Roles".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: Settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Settings" (
    key character varying(100) NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Settings" OWNER TO postgres;

--
-- Name: ShipmentTrackings; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."ShipmentTrackings" OWNER TO postgres;

--
-- Name: ShipmentTrackings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ShipmentTrackings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ShipmentTrackings_id_seq" OWNER TO postgres;

--
-- Name: ShipmentTrackings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ShipmentTrackings_id_seq" OWNED BY public."ShipmentTrackings".id;


--
-- Name: UserCouponUsages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserCouponUsages" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    coupon_id integer NOT NULL,
    usage_count integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UserCouponUsages" OWNER TO postgres;

--
-- Name: UserCouponUsages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UserCouponUsages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserCouponUsages_id_seq" OWNER TO postgres;

--
-- Name: UserCouponUsages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserCouponUsages_id_seq" OWNED BY public."UserCouponUsages".id;


--
-- Name: UserCoupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserCoupons" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    coupon_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."UserCoupons" OWNER TO postgres;

--
-- Name: UserCoupons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UserCoupons_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserCoupons_id_seq" OWNER TO postgres;

--
-- Name: UserCoupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UserCoupons_id_seq" OWNED BY public."UserCoupons".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Users" OWNER TO postgres;

--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_id_seq" OWNER TO postgres;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: Addresses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Addresses" ALTER COLUMN id SET DEFAULT nextval('public."Addresses_id_seq"'::regclass);


--
-- Name: Brands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Brands" ALTER COLUMN id SET DEFAULT nextval('public."Brands_id_seq"'::regclass);


--
-- Name: CampaignProducts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CampaignProducts" ALTER COLUMN id SET DEFAULT nextval('public."CampaignProducts_id_seq"'::regclass);


--
-- Name: Campaigns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Campaigns" ALTER COLUMN id SET DEFAULT nextval('public."Campaigns_id_seq"'::regclass);


--
-- Name: CartItems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems" ALTER COLUMN id SET DEFAULT nextval('public."CartItems_id_seq"'::regclass);


--
-- Name: Carts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Carts" ALTER COLUMN id SET DEFAULT nextval('public."Carts_id_seq"'::regclass);


--
-- Name: Categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Categories" ALTER COLUMN id SET DEFAULT nextval('public."Categories_id_seq"'::regclass);


--
-- Name: CouponCategories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponCategories" ALTER COLUMN id SET DEFAULT nextval('public."CouponCategories_id_seq"'::regclass);


--
-- Name: CouponGroups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponGroups" ALTER COLUMN id SET DEFAULT nextval('public."CouponGroups_id_seq"'::regclass);


--
-- Name: CouponProducts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponProducts" ALTER COLUMN id SET DEFAULT nextval('public."CouponProducts_id_seq"'::regclass);


--
-- Name: Coupons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons" ALTER COLUMN id SET DEFAULT nextval('public."Coupons_id_seq"'::regclass);


--
-- Name: InventoryLogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryLogs" ALTER COLUMN id SET DEFAULT nextval('public."InventoryLogs_id_seq"'::regclass);


--
-- Name: OnlineShoppingAdvices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OnlineShoppingAdvices" ALTER COLUMN id SET DEFAULT nextval('public."OnlineShoppingAdvices_id_seq"'::regclass);


--
-- Name: OrderHistories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderHistories" ALTER COLUMN id SET DEFAULT nextval('public."OrderHistories_id_seq"'::regclass);


--
-- Name: OrderItems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems" ALTER COLUMN id SET DEFAULT nextval('public."OrderItems_id_seq"'::regclass);


--
-- Name: Orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders" ALTER COLUMN id SET DEFAULT nextval('public."Orders_id_seq"'::regclass);


--
-- Name: Payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments" ALTER COLUMN id SET DEFAULT nextval('public."Payments_id_seq"'::regclass);


--
-- Name: Products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products" ALTER COLUMN id SET DEFAULT nextval('public."Products_id_seq"'::regclass);


--
-- Name: ProfitLogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProfitLogs" ALTER COLUMN id SET DEFAULT nextval('public."ProfitLogs_id_seq"'::regclass);


--
-- Name: Reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews" ALTER COLUMN id SET DEFAULT nextval('public."Reviews_id_seq"'::regclass);


--
-- Name: Roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Roles" ALTER COLUMN id SET DEFAULT nextval('public."Roles_id_seq"'::regclass);


--
-- Name: ShipmentTrackings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentTrackings" ALTER COLUMN id SET DEFAULT nextval('public."ShipmentTrackings_id_seq"'::regclass);


--
-- Name: UserCouponUsages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCouponUsages" ALTER COLUMN id SET DEFAULT nextval('public."UserCouponUsages_id_seq"'::regclass);


--
-- Name: UserCoupons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCoupons" ALTER COLUMN id SET DEFAULT nextval('public."UserCoupons_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Data for Name: Addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Addresses" (id, user_id, street, city, state, zip_code, country, is_default, "createdAt", "updatedAt") FROM stdin;
1	1	123 Test Street	Tehran	Tehran	12345	Iran	t	2025-07-21 14:52:07.047+03:30	2025-07-21 14:52:07.047+03:30
\.


--
-- Data for Name: Brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Brands" (id, name, "createdAt", "updatedAt") FROM stdin;
2	Chanel cosmetics	2025-07-27 14:03:15.501+03:30	2025-07-27 14:03:15.501+03:30
\.


--
-- Data for Name: CampaignProducts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CampaignProducts" (id, campaign_id, product_id, "createdAt", "updatedAt", campaign_price, original_price) FROM stdin;
4	2	3	2025-08-02 19:24:23.875+03:30	2025-08-02 20:12:10.673+03:30	15.99	19.99
5	3	1	2025-08-03 21:00:26.756+03:30	2025-08-03 21:00:26.756+03:30	250.00	799.99
\.


--
-- Data for Name: Campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Campaigns" (id, title, description, slug, banner_image_url, campaign_type, start_date, end_date, show_countdown, priority, cta_link, is_active, "createdAt", "updatedAt") FROM stdin;
1	Summer Final Sale	Last chance for summer discounts!	summer-flash-sale	/banners/summer_flash.jpg	seasonal	2025-08-01 03:30:00+03:30	2025-09-01 03:29:59+03:30	t	10	/products?campaign=summer-flash-sale	t	2025-08-02 15:33:01.265+03:30	2025-08-02 15:34:58.245+03:30
2	Read More	Big discounts for summer products.	read-more	/banners/read_more.jpg	seasonal	2025-08-01 03:30:00+03:30	2025-11-01 03:29:59+03:30	t	100	/products/summer-collection	t	2025-08-02 19:24:23.834+03:30	2025-08-02 20:01:22.077+03:30
3	Summer Flash Sale	Get amazing discounts on summer products for a limited time!	summer-flash-sale-test	/banners/summer_sale.jpg	flash_sale	2025-08-01 03:30:00+03:30	2025-08-08 03:29:59+03:30	t	10	/products?campaign=summer-flash-sale	t	2025-08-03 21:00:26.721+03:30	2025-08-03 21:00:26.721+03:30
\.


--
-- Data for Name: CartItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItems" (id, cart_id, product_id, quantity, "createdAt", "updatedAt") FROM stdin;
15	1	2	1	2025-07-21 21:46:57.953+03:30	2025-07-21 21:46:57.953+03:30
16	1	1	1	2025-07-21 21:57:09.611+03:30	2025-07-21 21:57:09.611+03:30
\.


--
-- Data for Name: Carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Carts" (id, user_id, session_id, expires_at, "createdAt", "updatedAt") FROM stdin;
1	4	\N	2025-07-28 21:57:09.617+03:30	2025-07-21 15:12:18.317+03:30	2025-07-21 21:57:09.617+03:30
2	3	\N	2025-08-03 13:09:16.198+03:30	2025-07-21 22:10:16.985+03:30	2025-07-27 13:09:16.199+03:30
\.


--
-- Data for Name: Categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Categories" (id, name, description, "createdAt", "updatedAt", parent_id) FROM stdin;
1	Electronics	Smartphones, laptops, and gadgets.	2025-07-21 14:52:07.032+03:30	2025-07-21 14:52:07.032+03:30	\N
2	Books	Fiction, non-fiction, and educational books.	2025-07-21 14:52:07.032+03:30	2025-07-21 14:52:07.032+03:30	\N
3	Clothing	Apparel for men and women.	2025-07-21 14:52:07.032+03:30	2025-07-21 14:52:07.032+03:30	\N
\.


--
-- Data for Name: CouponCategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CouponCategories" (id, coupon_id, category_id, "createdAt", "updatedAt") FROM stdin;
1	13	3	2025-07-23 22:04:44.76+03:30	2025-07-23 22:04:44.76+03:30
\.


--
-- Data for Name: CouponGroups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CouponGroups" (id, name, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CouponProducts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CouponProducts" (id, coupon_id, product_id, "createdAt", "updatedAt") FROM stdin;
1	7	1	2025-07-21 21:44:40.493+03:30	2025-07-21 21:44:40.493+03:30
\.


--
-- Data for Name: Coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Coupons" (id, code, discount_type, discount_value, min_amount, usage_limit, used_count, expiry_date, "isActive", "createdAt", "updatedAt", is_first_purchase_only, is_exclusive, max_usage_per_user, coupon_group_id, max_discount_amount) FROM stdin;
1	TESTBASIC	percentage	10.00	0.00	\N	0	2025-12-31	t	2025-07-21 15:11:27.367+03:30	2025-07-21 15:11:27.367+03:30	f	f	\N	\N	\N
2	MINORDER1000	fixed_amount	50.00	1000.00	\N	-3	2025-12-31	t	2025-07-21 16:10:19.277+03:30	2025-07-21 16:43:34.323+03:30	f	f	\N	\N	\N
3	FIRSTBUY	percentage	20.00	0.00	\N	-1	2025-12-31	t	2025-07-21 20:43:11.154+03:30	2025-07-21 21:05:44.45+03:30	t	f	\N	\N	\N
4	LIMIT2PERUSER	fixed_amount	10.00	0.00	\N	0	2025-12-31	t	2025-07-21 21:15:36.669+03:30	2025-07-21 21:15:36.669+03:30	f	f	2	\N	\N
7	PRODSPECIFIC	percentage	10.00	0.00	\N	-2	2025-12-31	t	2025-07-21 21:44:40.473+03:30	2025-07-21 21:59:52.994+03:30	f	f	\N	\N	\N
9	PRIVATEUSER	fixed_amount	50.00	0.00	\N	-1	2025-12-31	t	2025-07-21 22:08:59.419+03:30	2025-07-21 22:10:47.513+03:30	f	f	\N	\N	\N
10	FREESHIP	free_shipping	0.00	0.00	\N	0	2025-12-31	t	2025-07-21 22:11:26.491+03:30	2025-07-21 22:11:26.491+03:30	f	f	\N	\N	\N
11	PERCENT20CAP50	percentage	20.00	0.00	\N	-1	2025-12-31	t	2025-07-23 21:53:09.337+03:30	2025-07-23 21:56:32.278+03:30	f	f	\N	\N	50.00
13	CATSPECIFIC	percentage	15.00	0.00	\N	0	2025-12-31	t	2025-07-23 22:04:44.747+03:30	2025-07-23 22:04:44.747+03:30	f	f	\N	\N	\N
\.


--
-- Data for Name: InventoryLogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InventoryLogs" (id, product_id, order_id, change_type, quantity_change, new_stock_quantity, old_stock_quantity, changed_by_user_id, description, "createdAt", "updatedAt") FROM stdin;
57	1	\N	buy_price_update	0	42	42	2	Product 1 - Buy price updated from 0.00 to 760	2025-07-24 16:49:53.884+03:30	2025-07-24 16:49:53.884+03:30
58	1	\N	buy_price_update	0	42	42	2	Product 1 - Buy price updated from 760.00 to 750	2025-07-24 16:50:32.932+03:30	2025-07-24 16:50:32.932+03:30
40	1	\N	Order_Canceled	1	43	42	4	Product 1  returned to inventory 1 units .	2025-07-21 21:59:52.913+03:30	2025-07-21 21:59:52.913+03:30
41	2	\N	Order_Canceled	1	8	7	4	Product 2  returned to inventory 1 units .	2025-07-21 21:59:52.987+03:30	2025-07-21 21:59:52.987+03:30
42	1	19	reserve	-1	42	43	2	Order 19 - Reserved 1 units of 1 for unpaid order.	2025-07-21 22:10:33.667+03:30	2025-07-21 22:10:33.667+03:30
43	1	\N	Order_Canceled	1	43	42	2	Product 1  returned to inventory 1 units .	2025-07-21 22:10:47.431+03:30	2025-07-21 22:10:47.431+03:30
44	1	20	reserve	-1	42	43	2	Order 20 - Reserved 1 units of 1 for unpaid order.	2025-07-21 22:11:50.481+03:30	2025-07-21 22:11:50.481+03:30
45	1	\N	Order_Canceled	1	43	42	2	Product 1  returned to inventory 1 units .	2025-07-23 16:28:09.778+03:30	2025-07-23 16:28:09.778+03:30
46	1	21	reserve	-1	42	43	3	Order 21 - Reserved 1 units of 1 for unpaid order.	2025-07-23 21:55:48.654+03:30	2025-07-23 21:55:48.654+03:30
47	1	\N	Order_Canceled	1	43	42	3	Product 1  returned to inventory 1 units .	2025-07-23 21:56:32.2+03:30	2025-07-23 21:56:32.2+03:30
48	1	22	reserve	-1	42	43	3	Order 22 - Reserved 1 units of 1 for unpaid order.	2025-07-23 22:06:27.46+03:30	2025-07-23 22:06:27.46+03:30
49	4	22	reserve	-1	189	190	3	Order 22 - Reserved 1 units of 4 for unpaid order.	2025-07-23 22:06:27.475+03:30	2025-07-23 22:06:27.475+03:30
59	1	\N	manual_decrease	-32	10	42	2	Product 1 - Stock changed. Old Buy Price: 750.00, New Buy Price: 770	2025-07-26 13:18:01.725+03:30	2025-07-26 13:18:01.725+03:30
60	1	\N	restock	25	35	10	2	Product 1 - Stock changed. Old Buy Price: 770.00, New Buy Price: 762.8571428571429	2025-07-26 13:35:22.213+03:30	2025-07-26 13:35:22.213+03:30
61	1	\N	restock	5	40	35	2	Product 1 - Stock changed. Old Buy Price: 762.86, New Buy Price: 767.5025	2025-07-26 13:47:06.27+03:30	2025-07-26 13:47:06.27+03:30
62	1	\N	buy_price_update	0	40	40	2	Product 1 - Buy price updated from 767.50 to 770	2025-07-26 13:48:23.409+03:30	2025-07-26 13:48:23.409+03:30
63	1	\N	manual_decrease	-10	30	40	2	Product 1 - Stock changed. Old Buy Price: 770.00, New Buy Price: 770.00	2025-07-26 13:51:08.823+03:30	2025-07-26 13:51:08.823+03:30
64	1	\N	expired_order_return	1	31	30	\N	Inventory returned from expired order 22.	2025-07-26 14:00:00.141+03:30	2025-07-26 14:00:00.141+03:30
65	4	\N	expired_order_return	1	190	189	\N	Inventory returned from expired order 22.	2025-07-26 14:00:00.146+03:30	2025-07-26 14:00:00.146+03:30
66	1	23	reserve	-4	27	31	3	Order 23 - Reserved 4 units of 1 for unpaid order.	2025-07-26 14:50:34.081+03:30	2025-07-26 14:50:34.081+03:30
67	1	\N	sold	-4	27	31	3	Sold 4 units for order 23	2025-07-26 15:09:34.784+03:30	2025-07-26 15:09:34.784+03:30
68	3	\N	restock	110	208	98	2	Product 3 - Stock changed. Old Buy Price: 0.00, New Buy Price: 15	2025-07-26 16:14:20.117+03:30	2025-07-26 16:14:20.117+03:30
69	4	\N	restock	110	300	190	2	Product 4 - Stock changed. Old Buy Price: 0.00, New Buy Price: 20	2025-07-26 16:15:16.67+03:30	2025-07-26 16:15:16.67+03:30
70	3	24	reserve	-10	198	208	3	Order 24 - Reserved 10 units of 3 for unpaid order.	2025-07-26 16:18:41.595+03:30	2025-07-26 16:18:41.595+03:30
71	4	24	reserve	-15	285	300	3	Order 24 - Reserved 15 units of 4 for unpaid order.	2025-07-26 16:18:41.627+03:30	2025-07-26 16:18:41.627+03:30
72	3	\N	sold	-10	198	208	3	Sold 10 units for order 24	2025-07-26 16:20:25.998+03:30	2025-07-26 16:20:25.998+03:30
73	4	\N	sold	-15	285	300	3	Sold 15 units for order 24	2025-07-26 16:20:26.008+03:30	2025-07-26 16:20:26.008+03:30
74	4	25	reserve	-15	270	285	3	Order 25 - Reserved 15 units of 4 for unpaid order.	2025-07-27 13:09:52.717+03:30	2025-07-27 13:09:52.717+03:30
75	4	\N	sold	-15	270	285	3	Sold 15 units for order 25	2025-07-27 13:11:49.957+03:30	2025-07-27 13:11:49.957+03:30
\.


--
-- Data for Name: OnlineShoppingAdvices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OnlineShoppingAdvices" (id, user_id, session_id, chat_text, date, object, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OrderHistories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderHistories" (id, order_id, status, changed_at, changed_by, "createdAt", "updatedAt") FROM stdin;
4	11	cancelled	2025-07-21 16:51:32.858+03:30	3	2025-07-21 16:51:32.859+03:30	2025-07-21 16:51:32.859+03:30
5	14	cancelled	2025-07-21 21:05:44.455+03:30	4	2025-07-21 21:05:44.455+03:30	2025-07-21 21:05:44.455+03:30
6	15	completed	2025-07-21 21:24:22.7+03:30	4	2025-07-21 21:24:22.7+03:30	2025-07-21 21:24:22.7+03:30
7	16	completed	2025-07-21 21:26:39.663+03:30	4	2025-07-21 21:26:39.663+03:30	2025-07-21 21:26:39.663+03:30
8	17	cancelled	2025-07-21 21:46:41.752+03:30	4	2025-07-21 21:46:41.752+03:30	2025-07-21 21:46:41.752+03:30
9	18	cancelled	2025-07-21 21:59:52.999+03:30	4	2025-07-21 21:59:52.999+03:30	2025-07-21 21:59:52.999+03:30
10	19	cancelled	2025-07-21 22:10:47.517+03:30	2	2025-07-21 22:10:47.517+03:30	2025-07-21 22:10:47.517+03:30
11	20	cancelled	2025-07-23 16:28:09.855+03:30	2	2025-07-23 16:28:09.856+03:30	2025-07-23 16:28:09.856+03:30
12	21	cancelled	2025-07-23 21:56:32.283+03:30	3	2025-07-23 21:56:32.283+03:30	2025-07-23 21:56:32.283+03:30
13	22	expired	2025-07-26 14:00:00.147+03:30	\N	2025-07-26 14:00:00.148+03:30	2025-07-26 14:00:00.148+03:30
14	23	paid	2025-07-26 15:09:34.735+03:30	3	2025-07-26 15:09:34.736+03:30	2025-07-26 15:09:34.736+03:30
15	24	paid	2025-07-26 16:20:25.98+03:30	3	2025-07-26 16:20:25.98+03:30	2025-07-26 16:20:25.98+03:30
16	25	paid	2025-07-27 13:11:49.934+03:30	3	2025-07-27 13:11:49.935+03:30	2025-07-27 13:11:49.935+03:30
17	25	In Transit	2025-07-27 13:13:24.074+03:30	2	2025-07-27 13:13:24.074+03:30	2025-07-27 13:13:24.074+03:30
18	25	Delivered	2025-07-27 13:28:08.686+03:30	2	2025-07-27 13:28:08.687+03:30	2025-07-27 13:28:08.687+03:30
\.


--
-- Data for Name: OrderItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItems" (id, order_id, product_id, quantity, price_at_purchase, "createdAt", "updatedAt") FROM stdin;
12	11	4	1	25.00	2025-07-21 16:51:06.769+03:30	2025-07-21 16:51:06.769+03:30
15	14	4	2	25.00	2025-07-21 21:04:55.947+03:30	2025-07-21 21:04:55.947+03:30
16	15	4	1	25.00	2025-07-21 21:17:55.348+03:30	2025-07-21 21:17:55.348+03:30
18	15	4	1	25.00	2025-07-21 21:24:22.689+03:30	2025-07-21 21:24:22.689+03:30
19	16	1	1	799.99	2025-07-21 21:25:00.909+03:30	2025-07-21 21:25:00.909+03:30
20	16	1	1	799.99	2025-07-21 21:26:39.65+03:30	2025-07-21 21:26:39.65+03:30
21	17	1	1	799.99	2025-07-21 21:46:14.983+03:30	2025-07-21 21:46:14.983+03:30
22	18	1	1	799.99	2025-07-21 21:47:08.711+03:30	2025-07-21 21:47:08.711+03:30
23	18	2	1	1299.99	2025-07-21 21:47:08.714+03:30	2025-07-21 21:47:08.714+03:30
24	19	1	1	799.99	2025-07-21 22:10:33.676+03:30	2025-07-21 22:10:33.676+03:30
25	20	1	1	799.99	2025-07-21 22:11:50.49+03:30	2025-07-21 22:11:50.49+03:30
26	21	1	1	799.99	2025-07-23 21:55:48.695+03:30	2025-07-23 21:55:48.695+03:30
27	22	1	1	799.99	2025-07-23 22:06:27.479+03:30	2025-07-23 22:06:27.479+03:30
28	22	4	1	25.00	2025-07-23 22:06:27.481+03:30	2025-07-23 22:06:27.481+03:30
29	23	1	4	799.99	2025-07-26 14:50:34.118+03:30	2025-07-26 14:50:34.118+03:30
30	24	3	10	19.99	2025-07-26 16:18:41.633+03:30	2025-07-26 16:18:41.633+03:30
31	24	4	15	25.00	2025-07-26 16:18:41.638+03:30	2025-07-26 16:18:41.638+03:30
32	25	4	15	25.00	2025-07-27 13:09:52.749+03:30	2025-07-27 13:09:52.749+03:30
\.


--
-- Data for Name: Orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Orders" (id, user_id, total_amount, status, shipping_address_id, payment_status, coupon_id, "createdAt", "updatedAt", discount_amount, shipping_cost, total_profit_amount) FROM stdin;
11	3	35.00	cancelled	1	unpaid	\N	2025-07-21 16:51:06.742+03:30	2025-07-21 16:51:32.856+03:30	\N	\N	0.00
14	4	50.00	cancelled	1	unpaid	3	2025-07-21 21:04:55.909+03:30	2025-07-21 21:05:44.452+03:30	\N	\N	0.00
15	4	25.00	processing	1	paid	4	2025-07-21 21:17:55.323+03:30	2025-07-21 21:24:22.662+03:30	\N	\N	0.00
16	4	799.99	processing	1	paid	4	2025-07-21 21:25:00.888+03:30	2025-07-21 21:26:39.637+03:30	\N	\N	0.00
17	4	729.99	cancelled	1	unpaid	7	2025-07-21 21:46:14.956+03:30	2025-07-21 21:46:41.751+03:30	\N	\N	0.00
18	4	2029.98	cancelled	1	unpaid	7	2025-07-21 21:47:08.683+03:30	2025-07-21 21:59:52.995+03:30	\N	\N	0.00
19	2	759.99	cancelled	1	unpaid	9	2025-07-21 22:10:33.655+03:30	2025-07-21 22:10:47.515+03:30	\N	\N	0.00
20	2	809.99	cancelled	1	unpaid	\N	2025-07-21 22:11:50.47+03:30	2025-07-23 16:28:09.854+03:30	\N	\N	0.00
21	3	759.99	cancelled	1	unpaid	11	2025-07-23 21:55:48.635+03:30	2025-07-23 21:56:32.281+03:30	\N	\N	0.00
22	3	831.24	expired	1	failed	13	2025-07-23 22:06:27.444+03:30	2025-07-26 14:00:00.137+03:30	\N	\N	0.00
23	3	3209.96	processing	1	paid	\N	2025-07-26 14:50:34.062+03:30	2025-07-26 15:09:34.732+03:30	0.00	10.00	119.96
24	3	584.90	processing	1	paid	\N	2025-07-26 16:18:41.579+03:30	2025-07-26 16:20:25.978+03:30	0.00	10.00	124.90
25	3	385.00	Delivered	1	paid	\N	2025-07-27 13:09:52.698+03:30	2025-07-27 13:28:08.684+03:30	0.00	10.00	75.00
\.


--
-- Data for Name: Payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payments" (id, order_id, transaction_id, amount, method, status, payment_date, refunded, refund_reason, "createdAt", "updatedAt") FROM stdin;
10	15	SDF4e6915fvc	25.00	Zarinpal	success	2025-07-21 21:24:22.669+03:30	f	\N	2025-07-21 21:24:22.669+03:30	2025-07-21 21:24:22.669+03:30
11	16	SDF4e6915fvc12	799.99	Zarinpal	success	2025-07-21 21:26:39.639+03:30	f	\N	2025-07-21 21:26:39.639+03:30	2025-07-21 21:26:39.639+03:30
12	23	32495848948649jhgv	3209.96	Zarinpal	success	2025-07-26 15:09:34.75+03:30	f	\N	2025-07-26 15:09:34.75+03:30	2025-07-26 15:09:34.75+03:30
13	24	SDFlQhWESPFDFS56	584.90	Zarinpal	success	2025-07-26 16:20:25.985+03:30	f	\N	2025-07-26 16:20:25.985+03:30	2025-07-26 16:20:25.985+03:30
14	25	adslxcknhhsiouwjflxkadcws895	385.00	Zarinpal	success	2025-07-27 13:11:49.942+03:30	f	\N	2025-07-27 13:11:49.942+03:30	2025-07-27 13:11:49.942+03:30
\.


--
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Products" (id, name, description, price, stock_quantity, image_url, category_id, views_count, sold_count, slug, "createdAt", "updatedAt", brand_id, buy_price, campaign_id) FROM stdin;
5	Limited Edition Headphone	Premium headphones with noise cancellation.	350.00	2	/uploads/products/default_headphone.jpg	1	120	1	limited-edition-headphone	2025-07-21 14:52:07.038+03:30	2025-07-21 14:52:07.038+03:30	\N	0.00	\N
4	T-Shirt Casual	Comfortable cotton t-shirt for everyday wear.	25.00	270	/uploads/products/default_tshirt.jpg	3	51	41	t-shirt-casual	2025-07-21 14:52:07.038+03:30	2025-07-27 13:11:49.954+03:30	\N	20.00	\N
2	Laptop Pro	High-performance laptop for professionals.	1299.99	8	/uploads/products/default_laptop.jpg	1	80	7	laptop-pro	2025-07-21 14:52:07.038+03:30	2025-08-02 15:34:58.251+03:30	\N	0.00	\N
3	The Great Novel	A captivating story that will keep you hooked.	19.99	198	/uploads/products/default_book.jpg	2	202	27	the-great-novel	2025-07-21 14:52:07.038+03:30	2025-08-02 20:04:41.579+03:30	\N	15.00	2
1	Smartphone X	Latest model smartphone with advanced features and camera.	799.99	27	/uploads/products/default_smartphone.jpg	1	102	14	smartphone-x	2025-07-21 14:52:07.038+03:30	2025-08-03 21:00:26.776+03:30	\N	770.00	3
\.


--
-- Data for Name: ProfitLogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProfitLogs" (id, order_id, order_item_id, product_id, item_quantity, sell_price_at_purchase, buy_price_at_purchase, profit_per_item, total_profit_amount, transaction_date, "createdAt", "updatedAt") FROM stdin;
1	23	19	1	4	799.99	770.00	29.99	119.96	2025-07-26 15:09:34.791+03:30	2025-07-26 15:09:34.791+03:30	2025-07-26 15:09:34.792+03:30
2	24	20	3	10	19.99	15.00	4.99	49.90	2025-07-26 16:20:26.002+03:30	2025-07-26 16:20:26.002+03:30	2025-07-26 16:20:26.002+03:30
3	24	21	4	15	25.00	20.00	5.00	75.00	2025-07-26 16:20:26.01+03:30	2025-07-26 16:20:26.01+03:30	2025-07-26 16:20:26.01+03:30
4	25	22	4	15	25.00	20.00	5.00	75.00	2025-07-27 13:11:49.963+03:30	2025-07-27 13:11:49.963+03:30	2025-07-27 13:11:49.963+03:30
\.


--
-- Data for Name: Reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Reviews" (id, user_id, product_id, rating, comment, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Roles" (id, name, "createdAt", "updatedAt") FROM stdin;
1	customer	2025-07-21 14:52:06.927+03:30	2025-07-21 14:52:06.927+03:30
2	admin	2025-07-21 14:52:06.933+03:30	2025-07-21 14:52:06.933+03:30
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
20250710193743-create-Role.js
20250710193813-create-User.js
20250710193843-create-Category.js
20250710193859-create-Product.js
20250710193915-create-Address.js
20250710193928-create-Cart.js
20250710193941-create-CartItem.js
20250710193956-create-Coupon.js
20250710194009-create-Order.js
20250710194018-create-OrderItem.js
20250710194032-create-Payment.js
20250710194045-create-Review.js
20250710194107-create-online-shopping-advice-table.js
20250710194127-create-OrderHistory.js
20250710194138-create-Setting.js
20250713105558-add-password-reset-fields-to-user.js
20250714161834-add-otp-fields-to-user.js
20250715104714-add-is-first-purchase-to-coupon.js
20250715124318-add-brand-to-products.js
20250716123950-create-inventory-log-table.js
20250718191737-add-comprehensive-coupon-features.js
20250722090359-add-coupon-categories.js
20250722091240-add-parent-id-to-category.js
20250723131855-add-max-discount-amount-to-coupon.js
20250723212653-add-profit-tracking.js
20250723215602-add-discount-shipping-to-orders.js
20250726110958-add-total-profit-to-orders.js
20250726162843-create-shipment-tracking-table.js
20250727130443-create-campaign-system.js
20250802121238-add-campaign-price-to-campaignProduct.js
20250802122125-add-original-price-to-campainProduct.js
\.


--
-- Data for Name: Settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Settings" (key, value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ShipmentTrackings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShipmentTrackings" (id, order_id, provider_name, tracking_code, status, estimated_delivery_date, last_update_date, "createdAt", "updatedAt") FROM stdin;
1	25	Post	IR1234567890	Delivered	2025-07-27 03:30:00+03:30	2025-07-27 13:28:08.672+03:30	2025-07-27 13:13:24.059+03:30	2025-07-27 13:28:08.673+03:30
\.


--
-- Data for Name: UserCouponUsages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserCouponUsages" (id, user_id, coupon_id, usage_count, "createdAt", "updatedAt") FROM stdin;
1	4	4	2	2025-07-21 21:24:22.711+03:30	2025-07-21 21:26:39.674+03:30
\.


--
-- Data for Name: UserCoupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserCoupons" (id, user_id, coupon_id, "createdAt", "updatedAt") FROM stdin;
1	2	9	2025-07-21 22:08:59.438+03:30	2025-07-21 22:08:59.438+03:30
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (id, username, email, password, first_name, last_name, phone_number, role_id, "createdAt", "updatedAt", "resetPasswordToken", "resetPasswordExpires", otp_code, otp_expires_at) FROM stdin;
1	adminuser	admin@example.com	$2b$10$DXjeGlY0mayIWFKBm2cc0uYiiuzPHUmgiWek11ehDyJOCKc1xYU8K	Admin	User	09000000000	2	2025-07-21 14:52:07.029+03:30	2025-07-21 14:52:07.029+03:30	\N	\N	\N	\N
3	yegane	yegane@example.com	$2b$10$y1daRtAuUD4dzJE.AxJETOWp5F1rA1w5.nwQ2MTpdF5IfYPcrGnYG	Yeganeh	Shiri	09226494251	1	2025-07-21 14:54:35.572+03:30	2025-07-21 14:54:35.572+03:30	\N	\N	\N	\N
2	Alireza	alireza@example.com	$2b$10$YRLd8LtkQvE6Z99D9y7lteXooZbEMfWEsh8YczmdJiJQMYlWLte3y	Alireza	Doosti	09193447890	2	2025-07-21 14:54:00.383+03:30	2025-07-21 14:54:00.383+03:30	\N	\N	\N	\N
4	test	user@example.com	$2b$10$lyHYpaAjLuojna5vda5BNeGasr2J/I0Sg1Nh00i5v2Y1cE63LJ1iS	John	Doe	09123456789	1	2025-07-21 20:40:50.601+03:30	2025-07-21 20:40:50.601+03:30	\N	\N	\N	\N
5	bardia	bardia@example.com	$2b$10$0jEZLYS4NWbEKGZer3EH4.OKFV5Lz0OLGiiqZcjKwglz1o7nZiUPm	Bardia	Doosti	09123456789	1	2025-07-27 13:31:21.389+03:30	2025-07-27 13:31:21.389+03:30	\N	\N	\N	\N
\.


--
-- Name: Addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Addresses_id_seq"', 1, true);


--
-- Name: Brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Brands_id_seq"', 2, true);


--
-- Name: CampaignProducts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CampaignProducts_id_seq"', 5, true);


--
-- Name: Campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Campaigns_id_seq"', 3, true);


--
-- Name: CartItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CartItems_id_seq"', 22, true);


--
-- Name: Carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Carts_id_seq"', 2, true);


--
-- Name: Categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Categories_id_seq"', 3, true);


--
-- Name: CouponCategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CouponCategories_id_seq"', 1, true);


--
-- Name: CouponGroups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CouponGroups_id_seq"', 1, false);


--
-- Name: CouponProducts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CouponProducts_id_seq"', 1, true);


--
-- Name: Coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Coupons_id_seq"', 13, true);


--
-- Name: InventoryLogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."InventoryLogs_id_seq"', 75, true);


--
-- Name: OnlineShoppingAdvices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OnlineShoppingAdvices_id_seq"', 1, false);


--
-- Name: OrderHistories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderHistories_id_seq"', 18, true);


--
-- Name: OrderItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderItems_id_seq"', 32, true);


--
-- Name: Orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Orders_id_seq"', 25, true);


--
-- Name: Payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Payments_id_seq"', 14, true);


--
-- Name: Products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Products_id_seq"', 5, true);


--
-- Name: ProfitLogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProfitLogs_id_seq"', 4, true);


--
-- Name: Reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Reviews_id_seq"', 1, false);


--
-- Name: Roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Roles_id_seq"', 2, true);


--
-- Name: ShipmentTrackings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ShipmentTrackings_id_seq"', 1, true);


--
-- Name: UserCouponUsages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserCouponUsages_id_seq"', 1, true);


--
-- Name: UserCoupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserCoupons_id_seq"', 1, true);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_id_seq"', 5, true);


--
-- Name: Addresses Addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_pkey" PRIMARY KEY (id);


--
-- Name: Brands Brands_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Brands"
    ADD CONSTRAINT "Brands_name_key" UNIQUE (name);


--
-- Name: Brands Brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Brands"
    ADD CONSTRAINT "Brands_pkey" PRIMARY KEY (id);


--
-- Name: CampaignProducts CampaignProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CampaignProducts"
    ADD CONSTRAINT "CampaignProducts_pkey" PRIMARY KEY (id);


--
-- Name: Campaigns Campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_pkey" PRIMARY KEY (id);


--
-- Name: Campaigns Campaigns_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Campaigns"
    ADD CONSTRAINT "Campaigns_slug_key" UNIQUE (slug);


--
-- Name: CartItems CartItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pkey" PRIMARY KEY (id);


--
-- Name: Carts Carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_pkey" PRIMARY KEY (id);


--
-- Name: Categories Categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_name_key" UNIQUE (name);


--
-- Name: Categories Categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_pkey" PRIMARY KEY (id);


--
-- Name: CouponCategories CouponCategories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponCategories"
    ADD CONSTRAINT "CouponCategories_pkey" PRIMARY KEY (id);


--
-- Name: CouponGroups CouponGroups_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponGroups"
    ADD CONSTRAINT "CouponGroups_name_key" UNIQUE (name);


--
-- Name: CouponGroups CouponGroups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponGroups"
    ADD CONSTRAINT "CouponGroups_pkey" PRIMARY KEY (id);


--
-- Name: CouponProducts CouponProducts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponProducts"
    ADD CONSTRAINT "CouponProducts_pkey" PRIMARY KEY (id);


--
-- Name: Coupons Coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key" UNIQUE (code);


--
-- Name: Coupons Coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_pkey" PRIMARY KEY (id);


--
-- Name: InventoryLogs InventoryLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryLogs"
    ADD CONSTRAINT "InventoryLogs_pkey" PRIMARY KEY (id);


--
-- Name: OnlineShoppingAdvices OnlineShoppingAdvices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OnlineShoppingAdvices"
    ADD CONSTRAINT "OnlineShoppingAdvices_pkey" PRIMARY KEY (id);


--
-- Name: OrderHistories OrderHistories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderHistories"
    ADD CONSTRAINT "OrderHistories_pkey" PRIMARY KEY (id);


--
-- Name: OrderItems OrderItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_pkey" PRIMARY KEY (id);


--
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);


--
-- Name: Payments Payments_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_order_id_key" UNIQUE (order_id);


--
-- Name: Payments Payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_pkey" PRIMARY KEY (id);


--
-- Name: Payments Payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_transaction_id_key" UNIQUE (transaction_id);


--
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);


--
-- Name: Products Products_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_slug_key" UNIQUE (slug);


--
-- Name: ProfitLogs ProfitLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProfitLogs"
    ADD CONSTRAINT "ProfitLogs_pkey" PRIMARY KEY (id);


--
-- Name: Reviews Reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY (id);


--
-- Name: Roles Roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Roles"
    ADD CONSTRAINT "Roles_name_key" UNIQUE (name);


--
-- Name: Roles Roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Roles"
    ADD CONSTRAINT "Roles_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: Settings Settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_pkey" PRIMARY KEY (key);


--
-- Name: ShipmentTrackings ShipmentTrackings_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentTrackings"
    ADD CONSTRAINT "ShipmentTrackings_order_id_key" UNIQUE (order_id);


--
-- Name: ShipmentTrackings ShipmentTrackings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentTrackings"
    ADD CONSTRAINT "ShipmentTrackings_pkey" PRIMARY KEY (id);


--
-- Name: ShipmentTrackings ShipmentTrackings_tracking_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentTrackings"
    ADD CONSTRAINT "ShipmentTrackings_tracking_code_key" UNIQUE (tracking_code);


--
-- Name: UserCouponUsages UserCouponUsages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCouponUsages"
    ADD CONSTRAINT "UserCouponUsages_pkey" PRIMARY KEY (id);


--
-- Name: UserCoupons UserCoupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCoupons"
    ADD CONSTRAINT "UserCoupons_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_resetPasswordToken_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_resetPasswordToken_key" UNIQUE ("resetPasswordToken");


--
-- Name: Users Users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key" UNIQUE (username);


--
-- Name: CampaignProducts unique_campaign_product_constraint; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CampaignProducts"
    ADD CONSTRAINT unique_campaign_product_constraint UNIQUE (campaign_id, product_id);


--
-- Name: CouponCategories unique_coupon_category_constraint; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponCategories"
    ADD CONSTRAINT unique_coupon_category_constraint UNIQUE (coupon_id, category_id);


--
-- Name: CouponProducts unique_coupon_product_constraint; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponProducts"
    ADD CONSTRAINT unique_coupon_product_constraint UNIQUE (coupon_id, product_id);


--
-- Name: UserCoupons unique_user_coupon_constraint; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCoupons"
    ADD CONSTRAINT unique_user_coupon_constraint UNIQUE (user_id, coupon_id);


--
-- Name: UserCouponUsages unique_user_coupon_usage_constraint; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCouponUsages"
    ADD CONSTRAINT unique_user_coupon_usage_constraint UNIQUE (user_id, coupon_id);


--
-- Name: Reviews unique_user_product_review_constraint; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT unique_user_product_review_constraint UNIQUE (user_id, product_id);


--
-- Name: Addresses Addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Addresses"
    ADD CONSTRAINT "Addresses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignProducts CampaignProducts_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CampaignProducts"
    ADD CONSTRAINT "CampaignProducts_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public."Campaigns"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CampaignProducts CampaignProducts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CampaignProducts"
    ADD CONSTRAINT "CampaignProducts_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItems CartItems_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES public."Carts"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItems CartItems_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Carts Carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Categories Categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public."Categories"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CouponCategories CouponCategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponCategories"
    ADD CONSTRAINT "CouponCategories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public."Categories"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CouponCategories CouponCategories_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponCategories"
    ADD CONSTRAINT "CouponCategories_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CouponProducts CouponProducts_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponProducts"
    ADD CONSTRAINT "CouponProducts_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CouponProducts CouponProducts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponProducts"
    ADD CONSTRAINT "CouponProducts_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Coupons Coupons_coupon_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_coupon_group_id_fkey" FOREIGN KEY (coupon_group_id) REFERENCES public."CouponGroups"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InventoryLogs InventoryLogs_changed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryLogs"
    ADD CONSTRAINT "InventoryLogs_changed_by_user_id_fkey" FOREIGN KEY (changed_by_user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InventoryLogs InventoryLogs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryLogs"
    ADD CONSTRAINT "InventoryLogs_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InventoryLogs InventoryLogs_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryLogs"
    ADD CONSTRAINT "InventoryLogs_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OnlineShoppingAdvices OnlineShoppingAdvices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OnlineShoppingAdvices"
    ADD CONSTRAINT "OnlineShoppingAdvices_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderHistories OrderHistories_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderHistories"
    ADD CONSTRAINT "OrderHistories_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderHistories OrderHistories_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderHistories"
    ADD CONSTRAINT "OrderHistories_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItems OrderItems_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItems OrderItems_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Orders Orders_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Orders Orders_shipping_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_shipping_address_id_fkey" FOREIGN KEY (shipping_address_id) REFERENCES public."Addresses"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Orders Orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payments Payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payments"
    ADD CONSTRAINT "Payments_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Products Products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES public."Brands"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Products Products_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public."Campaigns"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Products Products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public."Categories"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProfitLogs ProfitLogs_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProfitLogs"
    ADD CONSTRAINT "ProfitLogs_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProfitLogs ProfitLogs_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProfitLogs"
    ADD CONSTRAINT "ProfitLogs_order_item_id_fkey" FOREIGN KEY (order_item_id) REFERENCES public."OrderItems"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProfitLogs ProfitLogs_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProfitLogs"
    ADD CONSTRAINT "ProfitLogs_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Reviews Reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reviews Reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ShipmentTrackings ShipmentTrackings_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShipmentTrackings"
    ADD CONSTRAINT "ShipmentTrackings_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCouponUsages UserCouponUsages_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCouponUsages"
    ADD CONSTRAINT "UserCouponUsages_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCouponUsages UserCouponUsages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCouponUsages"
    ADD CONSTRAINT "UserCouponUsages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCoupons UserCoupons_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCoupons"
    ADD CONSTRAINT "UserCoupons_coupon_id_fkey" FOREIGN KEY (coupon_id) REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserCoupons UserCoupons_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserCoupons"
    ADD CONSTRAINT "UserCoupons_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Users Users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public."Roles"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

