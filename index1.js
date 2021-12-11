//cu require includem pachetele folosite in proiect
const express = require('express');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {Client} =require('pg');
const url = require('url');
const { exec } = require("child_process");
const ejs=require('ejs');
const session = require('express-session');
const formidable = require('formidable');
const crypto = require('crypto');
const nodemailer = require("nodemailer");



var app=express();//am creat serverul

/*am facut un obiect de tip client*/
const client = new Client({
    host: "localhost",
    user: "ioana1",
    port: 5432,
    password: "parola",
    database: "produse"
})

client.connect()


//util-nu sterge!
// client.query('Select * from "Produse"', (err, res) =>{
//     if(!err){
//         console.log(res.rows);
//     }else {
//         console.log(err.message);
//     }
//     client.end;
// })

app.set("view engine","ejs");//setez ca motor de template ejs
console.log("Proiectul se afla la ",__dirname);//__dirname e folderul proiectului (variabila implicit setata de node)
app.use("/resurse",express.static(__dirname+"/resurse"));//setez folderul de resurse ca static, ca sa caute fisierele in el, in urma cererilor

function verificaImagini(){
	var textFisier=fs.readFileSync("resurse/json/galerie.json"); //citeste tot fisierul
	var jsi=JSON.parse(textFisier); //am transformat in obiect
	var caleGalerie=jsi.cale_galerie;
    let vectImagini=[]
	for (let im of jsi.imagini){
		var imgMare= path.join(caleGalerie, im.cale_imagine);//obtin calea completa (im.fisier are doar numele fisierului din folderul caleGalerie)
		var ext = path.extname(im.cale_imagine);//obtin extensia
		var numeFisier =path.basename(im.cale_imagine,ext)//obtin numele fara extensie
		let imgMica=path.join(caleGalerie+"/mic/", numeFisier+"-mic"+".webp");//creez cale apentru imaginea noua; prin extensia wbp stabilesc si tipul ei
        let imgMedie = path.join(caleGalerie+"/mediu/", numeFisier+"-mediu"+".webp");
        vectImagini.push({mare:imgMare, mediu:imgMedie, mic:imgMica, descriere:im.descriere, titlu:im.titlu, timp:im.timp}); //adauga in vector un element
		if (!fs.existsSync(imgMica))//daca nu exista imaginea, mai jos o voi crea
		sharp(imgMare)
		  .resize(150) //daca dau doar width(primul param) atunci height-ul e proportional
		  .toFile(imgMica, function(err) {
              if(err)
			    console.log("eroare conversie",imgMare, "->", imgMica, err);
		  });
        if (!fs.existsSync(imgMedie))
          sharp(imgMare)
            .resize(250) 
            .toFile(imgMedie, function(err) {
                if(err)
                  console.log("eroare conversie",imgMare, "->", imgMedie, err);
            });
	}
    return vectImagini;
}

function galerieStatica(imagini){
    //obtin ora curenta - ora
    var d = new Date();
    var timp_ora = d.getHours();
    let vectFinalImag =[];
    for (let imag of imagini)
    {
        //obtin intervalul orar corespunzator imaginii si il incarc intr-un vector: [ora1, min1, ora2, min2]      
        let interval_orar = imag.timp.replace('-',':').split(':');
        //Verific care imagini sunt potrivite pentru ora actuala a server-ului
        if(interval_orar[0]<=timp_ora && interval_orar[2]>timp_ora )
        {
            vectFinalImag.push(imag);
        }
    }

    while(vectFinalImag.length > 10)
    {
        vectFinalImag.pop();
    }
    
    return  vectFinalImag;
}


function galerieAnimata(imagini)
{
    let nrImag = [6, 6, 6, 6]; //de adaugat 14 si inca 2 poze;
    // let nrRand = nrImag[Math.floor(Math.random() * nrImag.length)];
    let nrRand = nrImag[Math.floor(Math.random() * 5)];
    let vectImagFinal = [];
    var poz = 0;
    while(nrRand>0)
    {
        // var poz = Math.floor(Math.random()* imagini.length);
        // if(!vectImagFinal.includes(imagini[poz])) 
        // {
        //     vectImagFinal.push(imagini[poz]);
        //     nrRand--;
        // }
        vectImagFinal.push(imagini[poz]);
        poz = poz + 2;
        nrRand--;

    }
    // console.log(vectImagFinal);
    return vectImagFinal;
}


let galImag = verificaImagini();
let galImagStat = galerieStatica(galImag);
let galImagAnimata = galerieAnimata(galImag);
//console.log(galImagAnimata);




//COMENTATA RECENT
// app.get("*/galerie-animata.css",function(req, res){
//     res.setHeader("Content-Type","text/css");//pregatesc raspunsul de tip css
//     let sirScss=fs.readFileSync("./resurse/scss/galerie_animata.scss").toString("utf-8");//citesc scss-ul ca string
//     let galImagAnimata = galerieAnimata(galImag);
//     let nrImagini = galImagAnimata.length;
//     let rezScss=ejs.render(sirScss,{nrImagini});// transmit culoarea catre scss si obtin sirul cu scss-ul compilat
//     fs.writeFileSync("./temp/galerie-animata.scss",rezScss);//scriu scss-ul intr-un fisier temporar
//     exec("sass ./temp/galerie-animata.scss ./temp/galerie-animata.css", (error, stdout, stderr) => {//execut comanda sass (asa cum am executa in cmd sau PowerShell)
//         if (error) {
//             console.log(`error: ${error.message}`);
//             res.end();//termin transmisiunea in caz de eroare
//             return;
//         }
//         if (stderr) {
//             console.log(`stderr: ${stderr}`);
//             res.end();
//             return;
//         }
//         console.log(`stdout: ${stdout}`);
//         //totul a fost bine, trimit fisierul rezultat din compilarea scss
//         res.sendFile(path.join(__dirname,"temp/galerie-animata.css"));
//     });
// });



//de la cofetarie
// app.get("*/galerie-animata.css",function(req, res){
//     /*Atentie modul de rezolvare din acest app.get() este strict pentru a demonstra niste tehnici
//     si nu pentru ca ar fi cel mai eficient mod de rezolvare*/
//     res.setHeader("Content-Type","text/css");//pregatesc raspunsul de tip css
//     let sirScss=fs.readFileSync("./resurse/scss/galerie_animata.scss").toString("utf-8");//citesc scss-ul cs string
//     culori=["navy","black","purple","grey"];
//     let culoareAleatoare =culori[Math.floor(Math.random()*culori.length)];//iau o culoare aleatoare pentru border
//     let rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});// transmit culoarea catre scss si obtin sirul cu scss-ul compilat
//     console.log(rezScss);
//     fs.writeFileSync("./temp/galerie-animata.scss",rezScss);//scriu scss-ul intr-un fisier temporar
//     exec("sass ./temp/galerie-animata.scss ./temp/galerie-animata.css", (error, stdout, stderr) => {//execut comanda sass (asa cum am executa in cmd sau PowerShell)
//         if (error) {
//             console.log(`error: ${error.message}`);
//             res.end();//termin transmisiunea in caz de eroare
//             return;
//         }
//         if (stderr) {
//             console.log(`stderr: ${stderr}`);
//             res.end();
//             return;
//         }
//         console.log(`stdout: ${stdout}`);
//         //totul a fost bine, trimit fisierul rezultat din compilarea scss
//         res.sendFile(path.join(__dirname,"temp/galerie-animata.css"));
//     });

// });



app.get("*/galerie-animata.css",function(req, res){
    res.setHeader("Content-Type","text/css");//pregatesc raspunsul de tip css
    let sirScss=fs.readFileSync("./resurse/scss/galerie-animata.scss").toString("utf-8");//citesc scss-ul ca string
    let galImagAnimata = galerieAnimata(galImag);
    let nrImagini = galImagAnimata.length;
    let rezScss=ejs.render(sirScss,{nrImagini});// transmit culoarea catre scss si obtin sirul cu scss-ul compilat
    fs.writeFileSync("./temp/galerie-animata.scss",rezScss);//scriu scss-ul intr-un fisier temporar
    exec("sass ./temp/galerie-animata.scss ./temp/galerie-animata.css", (error, stdout, stderr) => {//execut comanda sass (asa cum am executa in cmd sau PowerShell)
        if (error) {
            console.log(`error: ${error.message}`);
            res.end();//termin transmisiunea in caz de eroare
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            res.end();
            return;
        }
        
        //totul a fost bine, trimit fisierul rezultat din compilarea scss
        res.sendFile(path.join(__dirname,"temp/galerie-animata.css"));
    });
});













































// app.get("*/galerie-animata.css",function(req, res){
//     /*Atentie modul de rezolvare din acest app.get() este strict pentru a demonstra niste tehnici
//     si nu pentru ca ar fi cel mai eficient mod de rezolvare*/
//     res.setHeader("Content-Type","text/css");//pregatesc raspunsul de tip css
//     let sirScss=fs.readFileSync("./resurse/scss/galerie_animata.scss").toString("utf-8");//citesc scss-ul cs string
//     culori=["navy","black","purple","grey"]
//     let culoareAleatoare =culori[Math.floor(Math.random()*culori.length)];//iau o culoare aleatoare pentru border
//     let rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});// transmit culoarea catre scss si obtin sirul cu scss-ul compilat
//     console.log(rezScss);
//     fs.writeFileSync("./temp/galerie-animata.scss",rezScss);//scriu scss-ul intr-un fisier temporar
//     exec("sass ./temp/galerie-animata.scss ./temp/galerie-animata.css", (error, stdout, stderr) => {//execut comanda sass (asa cum am executa in cmd sau PowerShell)
//         if (error) {
//             console.log(`error: ${error.message}`);
//             res.end();//termin transmisiunea in caz de eroare
//             return;
//         }
//         if (stderr) {
//             console.log(`stderr: ${stderr}`);
//             res.end();
//             return;
//         }
//         console.log(`stdout: ${stdout}`);
//         //totul a fost bine, trimit fisierul rezultat din compilarea scss
//         res.sendFile(path.join(__dirname,"temp/galerie-animata.css"));
//     });

// });

app.get(["/","/index1"],function(req, res){//ca sa pot accesa pagina principala si cu localhost:8080 si cu localhost:8080/index
    const ip = req.ip;
   // console.log(ip);
    res.render("pagini/index1", {ip: ip, imagini: verificaImagini()}); /* relative intotdeauna la folderul views*/
})


//comnentat recent
// app.get("/", function(req,res){
//     const ip = req.ip;
//     console.log(ip);
//     res.render("pagini/index1", {ip: ip, imagini: verificaImagini()});
// });

//am scos statusul
// app.get("/galeriestatica", function(req, res){
//     res.status(403).render("pagini/galeriestatica", {imagini: galImagStat});
// })

 app.get("/galeriestatica", function(req, res){
     res.render("pagini/galeriestatica", {imagini: galImagStat});
 })
//  app.get("/galerieanimata", function(req, res){
//     res.render("pagini/galerieanimata", {imagini: galImagAnimata});
// })

app.get("/galerieanimata", function(req, res){
    res.render("pagini/galerieanimata", {imagini: verificaImagini()});
})

app.get("*/galerie.json", function(req, res){
    res.status(403).render("pagini/403");
})


// app.get(["/","/index"],function(req, res){
//     const ip = req.ip;
//     console.log(ip);
//     let galImagAnimata = galerieAnimata(galImag);
//     res.render("pagini/index", {ip: ip, imagini: galImagStat, galImagAnimata}); 
// });

app.get("/galeriestatica",function(req, res){
    res.render("pagini/galeriestatica", {imagini: verificaImagini()}); /* relative intotdeauna la folderul views*/
});

app.get("/produse", function(req, res){
    // console.log("Query:", req.query.categorie);
    // console.log(req.url);

    var conditie = req.query.categorie ? "and categorie='" + req.query.categorie+"'" : "";
   // console.log("select * from produse1 " + conditie);
    client.query("select * from produse1 where 1=1" + conditie, function(err,rez){
        client.query("select unnest(enum_range(null::categ_poza)) as categ", function(err,rezcateg){
           // console.log(rezcateg);
            res.render("pagini/produse", {produse:rez.rows, categorii:rezcateg.rows});
        });
        // res.render("pagini/produse", {produse:rez.rows});
        // console.log("Query:", req.query.);
        // console.log(req.url);
    });
});


app.get("/produs/:id_poza", function(req, res){
    // console.log(req.params);
    const rezultat = client.query("select * from produse1 where id="+ req.params.id_poza, function(err,rez){
       // console.log(rez.rows);
        res.render("pagini/produs", {prod:rez.rows[0]});
    });
});

let parolaServer= "tehniciweb";
app.post("/inreg", function(req, res){
    console.log("primit date");
     let formular = formidable.IncomingForm();
     formular.parse(req, function(err, campuriText, campuriFisier){
         //console.log(campuriText);
        let parolaCriptata= crypto.scryptSync(campuriText.parola,parolaServer, 32).toString('ascii');
        //let comanda = `insert into "utilizatori" (username, nume, prenume, parola) values ('${campuriText.username}','${campuriText.nume}','${campuriText.prenume}','${parolaCriptata}')`;
        let comanda = `insert into utilizatori (username, nume, prenume, parola) values ('${campuriText.username}','${campuriText.nume}','${campuriText.prenume}','${parolaCriptata}')`;
  
        console.log(comanda);
        client.query(comanda, function(err,rez){
            if(err){
                console.log(err);
                res.render("pagini/inregistrare", {err:"Eroare baza date! Reveniti mai tarziu", raspuns:"Datele nu au fost introduse."});
            }
            else{
                res.render("pagini/inregistrare", {err:"", raspuns:"All good!"});
            }
            res.render("pagini/inregistrare", {});
        });
    });
    
});


    // client.query(`insert into "utilizatori"(username, nume, prenume, parola) values ('a','b','c','d')`, function(err, res){
    //     if(!err){
    //         console.log(res.rows);
    //     }else {
    //         console.log(err.message);
    //     }
    //     client.end;
    // });
/*cerere generala*/
app.get("/*",function(req, res){    
    res.render("pagini"+req.url, function(err,rezultatRandare){
        if(err){
            if(err.message.includes("Failed to lookup view")){
                res.status(404).render("pagini/404");
            }
            else 
                throw err;
        }
        else{
            res.send(rezultatRandare);
        }
    });
});


verificaImagini();

app.listen(8082);
console.log("Serverul a pornit!");
