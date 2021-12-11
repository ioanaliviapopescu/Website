-- Table: public.utilizatori

-- DROP TABLE public.utilizatori;

CREATE TABLE public.utilizatori
(
    id integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    username character varying(200) COLLATE pg_catalog."default" NOT NULL,
    nume character varying(200) COLLATE pg_catalog."default" NOT NULL,
    prenume character varying(200) COLLATE pg_catalog."default" NOT NULL,
    parola character varying(200) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT utilizatori_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.utilizatori
    OWNER to ioana1;