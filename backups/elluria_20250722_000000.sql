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
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    coupon_group_id integer
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
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    brand_id integer
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
-- Name: Reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews" ALTER COLUMN id SET DEFAULT nextval('public."Reviews_id_seq"'::regclass);


--
-- Name: Roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Roles" ALTER COLUMN id SET DEFAULT nextval('public."Roles_id_seq"'::regclass);


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
\.


--
-- Data for Name: CartItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItems" (id, cart_id, product_id, quantity, "createdAt", "updatedAt") FROM stdin;
15	1	2	1	2025-07-21 21:46:57.953+03:30	2025-07-21 21:46:57.953+03:30
16	1	1	1	2025-07-21 21:57:09.611+03:30	2025-07-21 21:57:09.611+03:30
17	2	1	1	2025-07-21 22:10:25.518+03:30	2025-07-21 22:10:25.518+03:30
\.


--
-- Data for Name: Carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Carts" (id, user_id, session_id, expires_at, "createdAt", "updatedAt") FROM stdin;
1	4	\N	2025-07-28 21:57:09.617+03:30	2025-07-21 15:12:18.317+03:30	2025-07-21 21:57:09.617+03:30
2	2	380a5937-a652-4771-92be-449c33abb8c4	2025-07-28 22:10:25.523+03:30	2025-07-21 22:10:16.985+03:30	2025-07-21 22:10:25.523+03:30
\.


--
-- Data for Name: Categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Categories" (id, name, description, "createdAt", "updatedAt") FROM stdin;
1	Electronics	Smartphones, laptops, and gadgets.	2025-07-21 14:52:07.032+03:30	2025-07-21 14:52:07.032+03:30
2	Books	Fiction, non-fiction, and educational books.	2025-07-21 14:52:07.032+03:30	2025-07-21 14:52:07.032+03:30
3	Clothing	Apparel for men and women.	2025-07-21 14:52:07.032+03:30	2025-07-21 14:52:07.032+03:30
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

COPY public."Coupons" (id, code, discount_type, discount_value, min_amount, usage_limit, used_count, expiry_date, "isActive", "createdAt", "updatedAt", is_first_purchase_only, is_exclusive, max_usage_per_user, coupon_group_id) FROM stdin;
1	TESTBASIC	percentage	10.00	0.00	\N	0	2025-12-31	t	2025-07-21 15:11:27.367+03:30	2025-07-21 15:11:27.367+03:30	f	f	\N	\N
2	MINORDER1000	fixed_amount	50.00	1000.00	\N	-3	2025-12-31	t	2025-07-21 16:10:19.277+03:30	2025-07-21 16:43:34.323+03:30	f	f	\N	\N
3	FIRSTBUY	percentage	20.00	0.00	\N	-1	2025-12-31	t	2025-07-21 20:43:11.154+03:30	2025-07-21 21:05:44.45+03:30	t	f	\N	\N
4	LIMIT2PERUSER	fixed_amount	10.00	0.00	\N	0	2025-12-31	t	2025-07-21 21:15:36.669+03:30	2025-07-21 21:15:36.669+03:30	f	f	2	\N
7	PRODSPECIFIC	percentage	10.00	0.00	\N	-2	2025-12-31	t	2025-07-21 21:44:40.473+03:30	2025-07-21 21:59:52.994+03:30	f	f	\N	\N
9	PRIVATEUSER	fixed_amount	50.00	0.00	\N	-1	2025-12-31	t	2025-07-21 22:08:59.419+03:30	2025-07-21 22:10:47.513+03:30	f	f	\N	\N
10	FREESHIP	free_shipping	0.00	0.00	\N	0	2025-12-31	t	2025-07-21 22:11:26.491+03:30	2025-07-21 22:11:26.491+03:30	f	f	\N	\N
\.


--
-- Data for Name: InventoryLogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InventoryLogs" (id, product_id, order_id, change_type, quantity_change, new_stock_quantity, old_stock_quantity, changed_by_user_id, description, "createdAt", "updatedAt") FROM stdin;
25	4	11	reserve	-1	194	195	3	Order 11 - Reserved 1 units of 4 for unpaid order.	2025-07-21 16:51:06.76+03:30	2025-07-21 16:51:06.76+03:30
26	4	\N	Order_Canceled	1	195	194	3	Product 4  returned to inventory 1 units .	2025-07-21 16:51:32.792+03:30	2025-07-21 16:51:32.792+03:30
29	4	14	reserve	-2	189	191	4	Order 14 - Reserved 2 units of 4 for unpaid order.	2025-07-21 21:04:55.935+03:30	2025-07-21 21:04:55.935+03:30
30	4	\N	Order_Canceled	2	191	189	4	Product 4  returned to inventory 2 units .	2025-07-21 21:05:44.382+03:30	2025-07-21 21:05:44.382+03:30
31	4	15	reserve	-1	190	191	4	Order 15 - Reserved 1 units of 4 for unpaid order.	2025-07-21 21:17:55.34+03:30	2025-07-21 21:17:55.34+03:30
33	4	\N	sold	-1	190	191	4	Sold 1 units for order 15	2025-07-21 21:24:22.694+03:30	2025-07-21 21:24:22.694+03:30
34	1	16	reserve	-1	43	44	4	Order 16 - Reserved 1 units of 1 for unpaid order.	2025-07-21 21:25:00.901+03:30	2025-07-21 21:25:00.901+03:30
35	1	\N	sold	-1	43	44	4	Sold 1 units for order 16	2025-07-21 21:26:39.656+03:30	2025-07-21 21:26:39.656+03:30
36	1	17	reserve	-1	42	43	4	Order 17 - Reserved 1 units of 1 for unpaid order.	2025-07-21 21:46:14.971+03:30	2025-07-21 21:46:14.971+03:30
37	1	\N	Order_Canceled	1	43	42	4	Product 1  returned to inventory 1 units .	2025-07-21 21:46:41.669+03:30	2025-07-21 21:46:41.669+03:30
38	1	18	reserve	-1	42	43	4	Order 18 - Reserved 1 units of 1 for unpaid order.	2025-07-21 21:47:08.696+03:30	2025-07-21 21:47:08.696+03:30
39	2	18	reserve	-1	7	8	4	Order 18 - Reserved 1 units of 2 for unpaid order.	2025-07-21 21:47:08.709+03:30	2025-07-21 21:47:08.709+03:30
40	1	\N	Order_Canceled	1	43	42	4	Product 1  returned to inventory 1 units .	2025-07-21 21:59:52.913+03:30	2025-07-21 21:59:52.913+03:30
41	2	\N	Order_Canceled	1	8	7	4	Product 2  returned to inventory 1 units .	2025-07-21 21:59:52.987+03:30	2025-07-21 21:59:52.987+03:30
42	1	19	reserve	-1	42	43	2	Order 19 - Reserved 1 units of 1 for unpaid order.	2025-07-21 22:10:33.667+03:30	2025-07-21 22:10:33.667+03:30
43	1	\N	Order_Canceled	1	43	42	2	Product 1  returned to inventory 1 units .	2025-07-21 22:10:47.431+03:30	2025-07-21 22:10:47.431+03:30
44	1	20	reserve	-1	42	43	2	Order 20 - Reserved 1 units of 1 for unpaid order.	2025-07-21 22:11:50.481+03:30	2025-07-21 22:11:50.481+03:30
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
\.


--
-- Data for Name: Orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Orders" (id, user_id, total_amount, status, shipping_address_id, payment_status, coupon_id, "createdAt", "updatedAt") FROM stdin;
11	3	35.00	cancelled	1	unpaid	\N	2025-07-21 16:51:06.742+03:30	2025-07-21 16:51:32.856+03:30
14	4	50.00	cancelled	1	unpaid	3	2025-07-21 21:04:55.909+03:30	2025-07-21 21:05:44.452+03:30
15	4	25.00	processing	1	paid	4	2025-07-21 21:17:55.323+03:30	2025-07-21 21:24:22.662+03:30
16	4	799.99	processing	1	paid	4	2025-07-21 21:25:00.888+03:30	2025-07-21 21:26:39.637+03:30
17	4	729.99	cancelled	1	unpaid	7	2025-07-21 21:46:14.956+03:30	2025-07-21 21:46:41.751+03:30
18	4	2029.98	cancelled	1	unpaid	7	2025-07-21 21:47:08.683+03:30	2025-07-21 21:59:52.995+03:30
19	2	759.99	cancelled	1	unpaid	9	2025-07-21 22:10:33.655+03:30	2025-07-21 22:10:47.515+03:30
20	2	799.99	pending	1	unpaid	10	2025-07-21 22:11:50.47+03:30	2025-07-21 22:11:50.47+03:30
\.


--
-- Data for Name: Payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payments" (id, order_id, transaction_id, amount, method, status, payment_date, refunded, refund_reason, "createdAt", "updatedAt") FROM stdin;
10	15	SDF4e6915fvc	25.00	Zarinpal	success	2025-07-21 21:24:22.669+03:30	f	\N	2025-07-21 21:24:22.669+03:30	2025-07-21 21:24:22.669+03:30
11	16	SDF4e6915fvc12	799.99	Zarinpal	success	2025-07-21 21:26:39.639+03:30	f	\N	2025-07-21 21:26:39.639+03:30	2025-07-21 21:26:39.639+03:30
\.


--
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Products" (id, name, description, price, stock_quantity, image_url, category_id, views_count, sold_count, slug, "createdAt", "updatedAt", brand_id) FROM stdin;
5	Limited Edition Headphone	Premium headphones with noise cancellation.	350.00	2	/uploads/products/default_headphone.jpg	1	120	1	limited-edition-headphone	2025-07-21 14:52:07.038+03:30	2025-07-21 14:52:07.038+03:30	\N
4	T-Shirt Casual	Comfortable cotton t-shirt for everyday wear.	25.00	190	/uploads/products/default_tshirt.jpg	3	50	11	t-shirt-casual	2025-07-21 14:52:07.038+03:30	2025-07-21 21:24:22.692+03:30	\N
2	Laptop Pro	High-performance laptop for professionals.	1299.99	8	/uploads/products/default_laptop.jpg	1	80	7	laptop-pro	2025-07-21 14:52:07.038+03:30	2025-07-21 21:59:52.989+03:30	\N
1	Smartphone X	Latest model smartphone with advanced features and camera.	799.99	42	/uploads/products/default_smartphone.jpg	1	100	10	smartphone-x	2025-07-21 14:52:07.038+03:30	2025-07-21 22:11:50.478+03:30	\N
3	The Great Novel	A captivating story that will keep you hooked.	19.99	98	/uploads/products/default_book.jpg	2	200	17	the-great-novel	2025-07-21 14:52:07.038+03:30	2025-07-21 15:59:33.892+03:30	\N
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
\.


--
-- Data for Name: Settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Settings" (key, value, "createdAt", "updatedAt") FROM stdin;
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
\.


--
-- Name: Addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Addresses_id_seq"', 1, true);


--
-- Name: Brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Brands_id_seq"', 1, false);


--
-- Name: CartItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CartItems_id_seq"', 17, true);


--
-- Name: Carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Carts_id_seq"', 2, true);


--
-- Name: Categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Categories_id_seq"', 3, true);


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

SELECT pg_catalog.setval('public."Coupons_id_seq"', 10, true);


--
-- Name: InventoryLogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."InventoryLogs_id_seq"', 44, true);


--
-- Name: OnlineShoppingAdvices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OnlineShoppingAdvices_id_seq"', 1, false);


--
-- Name: OrderHistories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderHistories_id_seq"', 10, true);


--
-- Name: OrderItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderItems_id_seq"', 25, true);


--
-- Name: Orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Orders_id_seq"', 20, true);


--
-- Name: Payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Payments_id_seq"', 11, true);


--
-- Name: Products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Products_id_seq"', 5, true);


--
-- Name: Reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Reviews_id_seq"', 1, false);


--
-- Name: Roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Roles_id_seq"', 2, true);


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

SELECT pg_catalog.setval('public."Users_id_seq"', 4, true);


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
-- Name: Products Products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public."Categories"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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

