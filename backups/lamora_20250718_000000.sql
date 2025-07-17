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
    is_first_purchase_only boolean DEFAULT false NOT NULL
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
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Data for Name: Addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Addresses" (id, user_id, street, city, state, zip_code, country, is_default, "createdAt", "updatedAt") FROM stdin;
1	1	123 Test Street	Tehran	Tehran	12345	Iran	t	2025-07-14 20:06:22.943+03:30	2025-07-14 20:06:22.943+03:30
2	2	123 Main St	Tehran	Tehran	12345	Iran	f	2025-07-15 15:03:08.721+03:30	2025-07-15 15:40:32.812+03:30
3	2	Eastern Toloe	zanjan	zamjan	4514156717	Iran	f	2025-07-15 15:40:32.827+03:30	2025-07-15 15:42:55.756+03:30
4	2	Eastern Toloe	zanjan	zamjan	4514156717	Iran	t	2025-07-15 15:42:55.761+03:30	2025-07-15 15:42:55.761+03:30
\.


--
-- Data for Name: Brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Brands" (id, name, "createdAt", "updatedAt") FROM stdin;
1	Apple	2025-07-16 00:00:00+03:30	2025-07-16 00:00:00+03:30
2	Asus	2025-07-16 00:00:00+03:30	2025-07-16 00:00:00+03:30
\.


--
-- Data for Name: CartItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItems" (id, cart_id, product_id, quantity, "createdAt", "updatedAt") FROM stdin;
9	7	8	13	2025-07-17 23:50:06.64+03:30	2025-07-17 23:50:06.64+03:30
\.


--
-- Data for Name: Carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Carts" (id, user_id, session_id, expires_at, "createdAt", "updatedAt") FROM stdin;
7	2	1b0f5414-db9b-40b5-8f17-031684536cf5	2025-07-24 23:50:06.643+03:30	2025-07-17 23:50:06.623+03:30	2025-07-17 23:50:06.643+03:30
\.


--
-- Data for Name: Categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Categories" (id, name, description, "createdAt", "updatedAt") FROM stdin;
1	Electronics	Smartphones, laptops, and gadgets.	2025-07-14 20:06:22.93+03:30	2025-07-14 20:06:22.93+03:30
2	Books	Fiction, non-fiction, and educational books.	2025-07-14 20:06:22.93+03:30	2025-07-14 20:06:22.93+03:30
3	Clothing	Apparel for men and women.	2025-07-14 20:06:22.93+03:30	2025-07-14 20:06:22.93+03:30
4	Software	Software and applications	2025-07-15 10:22:20.67+03:30	2025-07-15 10:22:20.67+03:30
5	Hardware	Computer hardware components	2025-07-15 10:22:20.715+03:30	2025-07-15 10:22:20.715+03:30
6	cosmetics for face	\N	2025-07-15 10:31:03.238+03:30	2025-07-15 10:31:03.238+03:30
\.


--
-- Data for Name: Coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Coupons" (id, code, discount_type, discount_value, min_amount, usage_limit, used_count, expiry_date, "isActive", "createdAt", "updatedAt", is_first_purchase_only) FROM stdin;
2	WELCOME2LAMORA	percentage	20.00	50.00	\N	0	\N	f	2025-07-15 09:40:58.226+03:30	2025-07-15 09:40:58.226+03:30	f
3	WELCOME	fixed	50000.00	0.00	99	0	2025-09-30	t	2025-07-15 14:51:11.764+03:30	2025-07-15 15:16:03.976+03:30	t
5	FREESHIP	fixed_amount	0.00	100.00	50	0	2025-12-31	t	2025-07-15 15:54:19.554+03:30	2025-07-15 15:54:19.554+03:30	t
6	Hello_Coder	fixed	150000.00	0.00	100	0	2025-12-29	f	2025-07-15 16:01:32.115+03:30	2025-07-15 16:02:43.517+03:30	f
1	NEWYEAR2025	percentage	10.00	50.00	99	-1	2025-12-31	t	2025-07-15 09:38:58.388+03:30	2025-07-16 20:30:49.465+03:30	f
4	DISCOUNT5	fixed_amount	5.00	20.00	9	0	2026-01-31	t	2025-07-15 15:54:19.516+03:30	2025-07-17 23:04:15.999+03:30	f
\.


--
-- Data for Name: InventoryLogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InventoryLogs" (id, product_id, change_type, quantity_change, new_stock_quantity, old_stock_quantity, changed_by_user_id, description, "createdAt", "updatedAt") FROM stdin;
1	8	sale	-10	40	50	2	Order 8 - Sale of 10 units.	2025-07-16 16:31:23.946+03:30	2025-07-16 16:31:23.946+03:30
2	1	import	-5	5	10	2	Manual update after bug	2025-07-16 16:46:02.164+03:30	2025-07-16 16:46:02.164+03:30
3	2	import	-1	4	5	2	End of year stock adjustment updated	2025-07-16 16:46:02.177+03:30	2025-07-16 16:46:02.177+03:30
4	1	import	15	20	5	2	recharging inventory	2025-07-16 16:53:14.383+03:30	2025-07-16 16:53:14.383+03:30
5	2	import	6	10	4	2	recharging inventory for campain	2025-07-16 16:53:14.393+03:30	2025-07-16 16:53:14.393+03:30
7	8	product_update	10	20	10	2	Product 8 - Changed  20 units.	2025-07-16 19:59:04.689+03:30	2025-07-16 19:59:04.689+03:30
8	8	product_update	-12	8	20	2	Product 8 - Changed  8 units.	2025-07-16 20:00:00.614+03:30	2025-07-16 20:00:00.614+03:30
9	10	Adding_New_Product	50	50	0	2	Product 10 Created - Added  50 units .	2025-07-16 20:13:30.101+03:30	2025-07-16 20:13:30.101+03:30
10	8	Order_Canceled	10	18	8	2	Product 8  returned to inventory 10 units .	2025-07-16 20:24:12.6+03:30	2025-07-16 20:24:12.6+03:30
11	8	sale	-5	13	18	2	Order 9 - Sale of 5 units.	2025-07-16 20:28:59.728+03:30	2025-07-16 20:28:59.728+03:30
12	5	sale	-1	1	2	2	Order 9 - Sale of 1 units.	2025-07-16 20:28:59.735+03:30	2025-07-16 20:28:59.735+03:30
13	6	sale	-2	8	10	2	Order 9 - Sale of 2 units.	2025-07-16 20:28:59.742+03:30	2025-07-16 20:28:59.742+03:30
14	8	Order_Canceled	5	18	13	2	Product 8  returned to inventory 5 units .	2025-07-16 20:30:49.398+03:30	2025-07-16 20:30:49.398+03:30
15	5	Order_Canceled	1	2	1	2	Product 5  returned to inventory 1 units .	2025-07-16 20:30:49.457+03:30	2025-07-16 20:30:49.457+03:30
16	6	Order_Canceled	2	10	8	2	Product 6  returned to inventory 2 units .	2025-07-16 20:30:49.46+03:30	2025-07-16 20:30:49.46+03:30
17	1	expired_order_return	1	21	20	\N	Inventory returned from expired order 3.	2025-07-17 20:12:00.278+03:30	2025-07-17 20:12:00.278+03:30
18	8	sale	-1	17	18	2	Order 10 - Sale of 1 units.	2025-07-17 21:43:34.732+03:30	2025-07-17 21:43:34.732+03:30
19	8	expired_order_return	1	18	17	\N	Inventory returned from expired order 10.	2025-07-17 22:00:00.145+03:30	2025-07-17 22:00:00.145+03:30
20	7	product_stock_update	1150	1200	50	2	Product 7 - Changed  1200 units.	2025-07-17 23:02:01.884+03:30	2025-07-17 23:02:01.884+03:30
21	7	sale	-200	1000	1200	2	Order 11 - Sale of 200 units.	2025-07-17 23:04:16.016+03:30	2025-07-17 23:04:16.016+03:30
22	8	sale	-5	13	18	2	Order 12 - Sale of 5 units.	2025-07-17 23:37:13.697+03:30	2025-07-17 23:37:13.697+03:30
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
1	8	cancelled	2025-07-16 20:24:12.682+03:30	2	2025-07-16 20:24:12.682+03:30	2025-07-16 20:24:12.682+03:30
2	9	cancelled	2025-07-16 20:30:49.467+03:30	2	2025-07-16 20:30:49.467+03:30	2025-07-16 20:30:49.467+03:30
3	3	expired	2025-07-17 20:12:00.293+03:30	\N	2025-07-17 20:12:00.293+03:30	2025-07-17 20:12:00.293+03:30
4	10	expired	2025-07-17 22:00:00.149+03:30	\N	2025-07-17 22:00:00.149+03:30	2025-07-17 22:00:00.149+03:30
\.


--
-- Data for Name: OrderItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItems" (id, order_id, product_id, quantity, price_at_purchase, "createdAt", "updatedAt") FROM stdin;
2	2	2	2	1299.99	2025-07-12 20:06:22.95+03:30	2025-07-12 20:06:22.95+03:30
3	2	5	1	350.00	2025-07-12 20:06:22.95+03:30	2025-07-12 20:06:22.95+03:30
4	3	1	1	799.99	2025-07-15 12:36:44.366+03:30	2025-07-15 12:36:44.366+03:30
5	4	2	2	1299.99	2025-07-15 12:36:44.378+03:30	2025-07-15 12:36:44.378+03:30
6	5	5	1	350.00	2025-07-15 12:36:44.386+03:30	2025-07-15 12:36:44.386+03:30
7	6	1	1	799.99	2025-07-15 15:16:03.992+03:30	2025-07-15 15:16:03.992+03:30
9	8	8	10	1999.99	2025-07-16 16:31:23.905+03:30	2025-07-16 16:31:23.905+03:30
10	9	8	5	1999.99	2025-07-16 20:28:59.716+03:30	2025-07-16 20:28:59.716+03:30
11	9	5	1	350.00	2025-07-16 20:28:59.731+03:30	2025-07-16 20:28:59.731+03:30
12	9	6	2	1000.00	2025-07-16 20:28:59.737+03:30	2025-07-16 20:28:59.737+03:30
13	10	8	1	1999.99	2025-07-17 21:43:34.726+03:30	2025-07-17 21:43:34.726+03:30
1	1	1	150	799.99	2025-07-09 20:06:22.949+03:30	2025-07-09 20:06:22.949+03:30
14	11	7	200	29.99	2025-07-17 23:04:16.01+03:30	2025-07-17 23:04:16.01+03:30
15	12	8	5	1999.99	2025-07-17 23:37:13.692+03:30	2025-07-17 23:37:13.692+03:30
\.


--
-- Data for Name: Orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Orders" (id, user_id, total_amount, status, shipping_address_id, payment_status, coupon_id, "createdAt", "updatedAt") FROM stdin;
1	1	799.99	delivered	1	paid	\N	2025-07-09 20:06:22.949+03:30	2025-07-09 20:06:22.949+03:30
2	1	2949.98	processing	1	paid	\N	2025-07-12 20:06:22.95+03:30	2025-07-12 20:06:22.95+03:30
4	1	2949.98	processing	1	paid	\N	2025-07-15 12:36:44.376+03:30	2025-07-15 12:36:44.376+03:30
5	1	350.00	delivered	1	paid	\N	2025-07-15 12:36:44.383+03:30	2025-07-15 12:36:44.383+03:30
8	2	19999.90	cancelled	1	unpaid	\N	2025-07-16 16:31:23.892+03:30	2025-07-16 20:24:12.68+03:30
9	2	11114.96	cancelled	1	unpaid	1	2025-07-16 20:28:59.703+03:30	2025-07-16 20:30:49.466+03:30
6	2	799.99	processing	2	paid	3	2025-07-15 15:16:03.983+03:30	2025-07-17 18:39:48.582+03:30
3	1	799.99	expired	1	failed	\N	2025-07-15 12:36:44.35+03:30	2025-07-17 20:12:00.257+03:30
10	2	1999.99	expired	1	failed	\N	2025-07-16 21:43:34.715+03:30	2025-07-17 22:00:00.141+03:30
11	2	5993.00	pending	1	unpaid	4	2025-07-17 23:04:16.001+03:30	2025-07-17 23:04:16.001+03:30
12	2	9999.95	processing	1	paid	\N	2025-07-17 23:37:13.682+03:30	2025-07-17 23:41:10.457+03:30
\.


--
-- Data for Name: Payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payments" (id, order_id, transaction_id, amount, method, status, payment_date, refunded, refund_reason, "createdAt", "updatedAt") FROM stdin;
1	1	TRX-12345-1752510982955	799.99	Zarinpal	success	2025-07-09 20:06:22.949+03:30	f	\N	2025-07-09 20:06:22.949+03:30	2025-07-09 20:06:22.949+03:30
2	2	TRX-67890-1752510982961	2949.98	CreditCard	success	2025-07-12 20:06:22.95+03:30	f	\N	2025-07-12 20:06:22.95+03:30	2025-07-12 20:06:22.95+03:30
9	5	TRX-ABC-1	799.99	Zarinpal	success	2025-07-15 03:30:00+03:30	f		2025-07-15 13:37:33.109+03:30	2025-07-15 13:37:33.109+03:30
10	4	TRX-DEF-2	2949.98	CreditCard	success	2025-07-15 03:30:00+03:30	f		2025-07-15 13:38:05.349+03:30	2025-07-15 13:38:05.349+03:30
11	6	A1B2C3D4E5F6	799.99	Zarinpal	success	2025-07-17 18:39:48.588+03:30	f	\N	2025-07-17 18:39:48.589+03:30	2025-07-17 18:39:48.589+03:30
12	12	alksnoqanwepiwadolasi	9999.95	Zarinpal	success	2025-07-17 23:41:10.46+03:30	f	\N	2025-07-17 23:41:10.461+03:30	2025-07-17 23:41:10.461+03:30
\.


--
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Products" (id, name, description, price, stock_quantity, image_url, category_id, views_count, sold_count, slug, "createdAt", "updatedAt", brand_id) FROM stdin;
3	The Great Novel	A captivating story that will keep you hooked.	19.99	100	/uploads/products/default_book.jpg	2	200	15	the-great-novel	2025-07-14 20:06:22.936+03:30	2025-07-14 20:06:22.936+03:30	\N
4	T-Shirt Casual	Comfortable cotton t-shirt for everyday wear.	25.00	200	/uploads/products/default_tshirt.jpg	3	50	10	t-shirt-casual	2025-07-14 20:06:22.936+03:30	2025-07-14 20:06:22.936+03:30	\N
7	The Art of Code	A book about programming philosophy	29.99	1000	\N	2	0	150	the-art-of-code	2025-07-15 10:36:19.473+03:30	2025-07-17 23:04:16.013+03:30	\N
8	MacBook	a laptop	1999.99	13	\N	1	2	0	,mac-book	2025-07-16 15:43:27.608+03:30	2025-07-17 23:37:13.695+03:30	1
2	Laptop Pro	High-performance laptop for professionals.	1299.99	10	/uploads/products/default_laptop.jpg	1	80	3	laptop-pro	2025-07-14 20:06:22.936+03:30	2025-07-16 16:53:14.391+03:30	\N
9	رژ لب	رژ لب 24 ساعته برند چنل	85000.00	50	\N	1	0	0	lipStick	2025-07-16 20:12:09.316+03:30	2025-07-16 20:12:09.316+03:30	1
10	 رژ تستی	رژ لب 24 ساعته برند چنل	85000.00	50	\N	1	0	0	test_lip	2025-07-16 20:13:30.089+03:30	2025-07-16 20:13:30.089+03:30	1
5	Limited Edition Headphone	Premium headphones with noise cancellation.	350.00	2	/uploads/products/default_headphone.jpg	1	120	1	limited-edition-headphone	2025-07-14 20:06:22.936+03:30	2025-07-16 20:30:49.459+03:30	\N
6	Laptop Air	Lightweight laptop for students	1000.00	10	\N	1	2	100	laptop-air	2025-07-15 10:36:19.456+03:30	2025-07-16 20:30:49.462+03:30	2
1	Smartphone X	Latest model smartphone with advanced features and camera.	799.99	21	/uploads/products/default_smartphone.jpg	1	100	5	smartphone-x	2025-07-14 20:06:22.936+03:30	2025-07-17 20:12:00.276+03:30	\N
\.


--
-- Data for Name: Reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Reviews" (id, user_id, product_id, rating, comment, "createdAt", "updatedAt") FROM stdin;
1	2	1	5	This product is amazing!	2025-07-15 09:49:50.755+03:30	2025-07-15 09:49:50.755+03:30
2	2	5	5	This product is good!	2025-07-15 09:50:10.725+03:30	2025-07-15 09:50:10.725+03:30
3	2	3	5	Awsome!!	2025-07-15 09:50:23.909+03:30	2025-07-15 09:50:23.909+03:30
4	2	7	3	Not so good	2025-07-16 14:15:12.694+03:30	2025-07-16 14:15:12.694+03:30
5	1	1	5	This phone is amazing for its price!	2025-07-16 23:40:39.815+03:30	2025-07-16 23:40:39.815+03:30
6	3	2	3	Good laptop! but battery life could be better.	2025-07-16 23:40:39.841+03:30	2025-07-16 23:44:02.769+03:30
\.


--
-- Data for Name: Roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Roles" (id, name, "createdAt", "updatedAt") FROM stdin;
1	customer	2025-07-14 20:06:22.832+03:30	2025-07-14 20:06:22.832+03:30
2	admin	2025-07-14 20:06:22.838+03:30	2025-07-14 20:06:22.838+03:30
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
\.


--
-- Data for Name: Settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Settings" (key, value, "createdAt", "updatedAt") FROM stdin;
site_name	Elluria Beauty Shop	2025-07-17 22:10:31.142+03:30	2025-07-17 22:10:55+03:30
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (id, username, email, password, first_name, last_name, phone_number, role_id, "createdAt", "updatedAt", "resetPasswordToken", "resetPasswordExpires", otp_code, otp_expires_at) FROM stdin;
1	adminuser	admin@example.com	$2b$10$fy81EM5VPE7mo53mcj9REer9YHNBR5TputN127SPzaP6dRHR/0C/a	Admin	User	09000000000	2	2025-07-14 20:06:22.927+03:30	2025-07-14 20:06:22.927+03:30	\N	\N	\N	\N
2	Alireza	alirezadoostiot@gmail.com	$2b$10$jo2EdayT.i2L3lgi46ta4.b90KWZU7Lira7.QokSDRrkwRcVOW7vq	علیرضا	دوستی	09193447890	2	2025-07-14 20:15:02.804+03:30	2025-07-14 20:22:03.861+03:30	\N	\N	\N	\N
3	user_import_1	user1@example.com	$2b$10$doXWigB3pMX5L4/jzeLKOeg52DYOGe6.8afgkveTfrh2JTIbVUfUG	Imported	User One	09111111111	1	2025-07-15 10:43:58.631+03:30	2025-07-15 10:43:58.631+03:30	\N	\N	\N	\N
4	user_import_2	user2@example.com	$2b$10$RlcOYAKsED8Oh22JKmVuk.pSPDzp2Sv5.2gZK580AM4yP9Rg3DzCO	Imported	User Two	09222222222	1	2025-07-15 10:43:58.725+03:30	2025-07-15 10:43:58.725+03:30	\N	\N	\N	\N
\.


--
-- Name: Addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Addresses_id_seq"', 4, true);


--
-- Name: Brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Brands_id_seq"', 1, false);


--
-- Name: CartItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CartItems_id_seq"', 9, true);


--
-- Name: Carts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Carts_id_seq"', 7, true);


--
-- Name: Categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Categories_id_seq"', 6, true);


--
-- Name: Coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Coupons_id_seq"', 6, true);


--
-- Name: InventoryLogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."InventoryLogs_id_seq"', 22, true);


--
-- Name: OnlineShoppingAdvices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OnlineShoppingAdvices_id_seq"', 1, false);


--
-- Name: OrderHistories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderHistories_id_seq"', 4, true);


--
-- Name: OrderItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderItems_id_seq"', 15, true);


--
-- Name: Orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Orders_id_seq"', 12, true);


--
-- Name: Payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Payments_id_seq"', 12, true);


--
-- Name: Products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Products_id_seq"', 10, true);


--
-- Name: Reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Reviews_id_seq"', 6, true);


--
-- Name: Roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Roles_id_seq"', 2, true);


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
-- Name: InventoryLogs InventoryLogs_changed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InventoryLogs"
    ADD CONSTRAINT "InventoryLogs_changed_by_user_id_fkey" FOREIGN KEY (changed_by_user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
-- Name: Users Users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public."Roles"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

