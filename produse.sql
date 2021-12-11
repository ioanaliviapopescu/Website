
-- Table: public.produse

-- DROP TABLE public.produse;

CREATE TABLE public.produse
(
    categorie character varying(100)[] COLLATE pg_catalog."default",
    culori character varying(100)[] COLLATE pg_catalog."default",
    data date,
    descriere character varying(30) COLLATE pg_catalog."default",
    dimensiune integer,
    id integer NOT NULL,
    nume character varying(30) COLLATE pg_catalog."default",
    pret integer,
    rating character varying(100)[] COLLATE pg_catalog."default",
    tip_artist character varying(100)[] COLLATE pg_catalog."default",
    monocroma boolean,
    source character varying(300) COLLATE pg_catalog."default",
    CONSTRAINT "Produse_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.produse
    OWNER to ioana1;

GRANT ALL ON TABLE public.produse TO ioana1;