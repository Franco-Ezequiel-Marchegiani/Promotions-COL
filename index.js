import axios from 'axios';
import  { GoogleSpreadsheet } from 'google-spreadsheet';
import informationTokens from './credenciales/credenciales_definitivas.json' assert { type: "json" };
import * as tokenFemmtoCol from "/Users/Franco/Desktop/credentials/FC.json" assert {type:'json'};
import { exportSheet,llamadaAPI, FilterByPromotionBucle, savingData, getDataCSV } from './funciones.js';
import * as dotenv from 'dotenv';
dotenv.config({path: ".env"});

const Cofondeo  = async () => {
    const head = {'Authorization':`Bearer ${tokenFemmtoCol.default.access_token}`};

    /* Optimizar código & Encriptar googleID, and others (lo mismo para ARG) */

    const credenciales  = informationTokens;                                               //Credenciales permisos GooglSheet
    const googleId      = '16I4qzEas5EiPElDBmviYcN7r8IhvV_sB_CXmj8z37wI';                  //ID permisos GooglSheet
    let arrayContenedorCoFondeoTotal = []
    const tmp = {};                                                                         //Es un objeto vacío para asignarle todas las propiedades de la API
    try {
        /*** Co Fondeo ***/
        const responseCoFondeo = await llamadaAPI("get","https://api.mercadolibre.com/seller-promotions/users/1206541284",head)
        //console.log(responseCoFondeo);
        let dataCoFondeo = responseCoFondeo.data.results;                                       //Almacenamos la respuesta en esta variable
        //console.log(dataCoFondeo);
        //Acá se filtran las promociones según su tipo
        let filtroPromocionDEAL = dataCoFondeo.filter(element => element.type == "DEAL")                                //Campañas tradicionales
        let filtroPromocionMarketPlaceCampaign = dataCoFondeo.filter(element => element.type == "MARKETPLACE_CAMPAIGN") //Campaña co-fondeada
        let filtroPromocionPrice_Discount = dataCoFondeo.filter(element => element.type == "Price_Discount")            //Descuento individual
        let filtroPromocionVolume = dataCoFondeo.filter(element => element.type == "VOLUME")                            //Descuento por volumen
        let filtroPromocionPre_Negotiated = dataCoFondeo.filter(element => element.type == "PRE_NEGOTIATED")            //Descuento pre-acordado por ítem
        let filtroPromocionDOD = dataCoFondeo.filter(element => element.type == "DOD")                                  //Oferta del día
        let filtroPromocionLightning = dataCoFondeo.filter(element => element.type == "LIGHTNING")                      //Oferta relámpago
        //console.log(filtroPromocionMarketPlaceCampaign);
        //Arrays contenedores según promoción para obtener el dato de los arrays
        let arrayDEAL = []; 
        let arrayMarketPlace_Campaign = []; 
        let arrayPrice_Discount = []; 
        let arrayVolume = []; 
        let arrayPre_Negotiated = []; 
        let arrayDOD = []; 
        let arrayLightning = []; 
        console.log("Iniciando extración de datos");
        /* 
        
        Me parece que va a ser mejor pasar por parámetro los elementos del objeto de c/ array, ya que varían según la promoción
        
        */
        //console.log(filtroPromocionDEAL);
        //Params: arrayARecorrer,arrayAPushearData, header api call
        let arrayDEAL_Data = await FilterByPromotionBucle(filtroPromocionDEAL,arrayDEAL,head)
        console.log("Productos con oferta 'Deal' listos");
        //console.log(arrayDEAL_Data);
        let arrayeMarketPlace_Campaign_Data = await FilterByPromotionBucle(filtroPromocionMarketPlaceCampaign,arrayMarketPlace_Campaign,head)
        console.log("Productos con oferta 'MarketPlace_Campaign' listos")
        console.log(arrayeMarketPlace_Campaign_Data);
        
        let arrayPrice_Discount_Data = await FilterByPromotionBucle(filtroPromocionPrice_Discount,arrayPrice_Discount,head)
        console.log("Productos con oferta 'Price_Discount' listos")
        //console.log(arrayPrice_Discount_Data);
        
        let arrayVolume_Data = await FilterByPromotionBucle(filtroPromocionVolume,arrayVolume,head)
        console.log("Productos con oferta 'Volume' listos")
        //console.log(arrayVolume_Data);
        
        let arrayPre_Negotiated_Data = await FilterByPromotionBucle(filtroPromocionPre_Negotiated,arrayPre_Negotiated,head)
        console.log("Productos con oferta 'Pre_Negotiated' listos")
        //console.log(arrayPre_Negotiated_Data);
        
        let arrayDOD_Data = await FilterByPromotionBucle(filtroPromocionDOD,arrayDOD,head)
        console.log("Productos con oferta 'DOD' listos")
        //console.log(arrayDOD_Data);
        
        let arrayLightning_Data = await FilterByPromotionBucle(filtroPromocionLightning,arrayLightning,head)
        console.log("Productos con oferta 'Lightning' listos")

        /* Acá lo ideal sería concatenar las promociones, O poner las promociones en una hoja nueva.
        También, queda añadir la lógica de que se sobreescriba y no se pise */

         /* Pusheamos la info al archivo CSV */
         console.log("Pusheando info al CSV");
        //Añado condicional preguntando si el array NO está vacío, sino, que no ejecute nada
        const sumaArray1 = arrayDEAL_Data.concat(arrayeMarketPlace_Campaign_Data);
        const sumaArray2 = sumaArray1 ? sumaArray1.concat(arrayPrice_Discount_Data) : "";
        const sumaArray3 = sumaArray2 ? sumaArray2.concat(arrayVolume_Data) : "";
        const sumaArray4 = sumaArray3 ? sumaArray3.concat(arrayDOD_Data) : "";
        const sumaArray5 = sumaArray4 ? sumaArray4.concat(arrayLightning_Data) : "";
        const arrayFinal = sumaArray5 ? sumaArray5.concat(arrayPrice_Discount_Data) : "";
        console.log(arrayFinal);
        console.log("Array entero");

        await savingData(arrayFinal , "arrayFinal");
        
         /* Pusheamos la info al archivo CSV */
         console.log("Pusheando info al CSV");
         
         const respuestaFinal  = await getDataCSV("arrayFinal");
     
        console.log("Array final");
        console.log("Importando data a Sheet");
        console.log(respuestaFinal);
        //exportSheet(googleId,credenciales,'Prueba COL',arrayContenedorCoFondeoTotal)
        await exportSheet(googleId,credenciales,'main',respuestaFinal)
        console.log("Finalizado la importación deñ data a Sheet");

    } catch (error) {
        console.log(error);
    }
}
Cofondeo();
//let prueba1 = 

//arrayeMarketPlace_Campaign_Data ? savingData(arrayeMarketPlace_Campaign_Data , "promotions_eMarketPlace_Campaign"): "";
//arrayPrice_Discount_Data ? savingData(arrayPrice_Discount_Data , "promotions_Price_Discount") : "";
//arrayVolume_Data ? savingData(arrayVolume_Data , "promotions_Volume"): "";
//arrayPre_Negotiated_Data ? savingData(arrayPre_Negotiated_Data , "promotions_Pre_Negotiated"): "";
//arrayDOD_Data ? savingData(arrayDOD_Data , "promotions_DOD"): "";
//arrayLightning_Data? savingData(arrayLightning_Data , "promotions_Lightning") : "";
        /* console.log(prueba1);
        let prueba2 = 
        console.log(prueba2);
        let prueba3 = 
        console.log(prueba3);
        let prueba4 = 
        console.log(prueba4);
        let prueba5 = 
        console.log(prueba5);
        let prueba6 = 
        console.log(prueba6);
        let prueba7 = 
        console.log(prueba7); */
/* 
    dateToday();
    //const respuestaFinalPromotions_DEAL  = await getDataCSV("promotions_DEAL");
//const respuestaFinalPromotions_eMarketPlace_Campaign   = await getDataCSV("promotions_eMarketPlace_Campaign");
//const respuestaFinalPromotions_Price_Discount  = await getDataCSV("promotions_Price_Discount");
//const respuestaFinalPromotions_Volume   = await getDataCSV("promotions_Volume");
//const respuestaFinalPromotions_Pre_Negotiated  = await getDataCSV("promotions_Pre_Negotiated");
//const respuestaFinalPromotions_DOD   = await getDataCSV("promotions_DOD");
//const respuestaFinalPromotions_Lightning   = await getDataCSV("promotions_Lightning");
    
    
         
         
         
         
 
         //console.log(respuestaFinalPromotions_DEAL);
         //console.log(respuestaFinalPromotions_eMarketPlace_Campaign);
         //console.log(respuestaFinalPromotions_Price_Discount);
         //console.log(respuestaFinalPromotions_Volume);
         //console.log(respuestaFinalPromotions_Pre_Negotiated);
         //console.log(respuestaFinalPromotions_DOD);
         //console.log(respuestaFinalPromotions_Lightning);

         //Bueno, esto ya está, queda definir si se hace todo en una hoja, o si se le dedica una hoja para c/ tipo de oferta

for (let i = 0; i < filtroPromocionVolume.length; i++) {
        const callItemPromotion = await axios({
            method: "get",
            url: `https://api.mercadolibre.com/seller-promotions/promotions/${filtroPromocionVolume[i].id}/items?promotion_type=${filtroPromocionVolume[i].type}`,
            headers: head
        })
        const respuestaItemPromotion = callItemPromotion.data.results
        if(respuestaItemPromotion){
            arrayVolume.push(...respuestaItemPromotion)
        }else{
            console.log("Upa, un array vacío")
        }
    }
    console.log("Productos con oferta 'Volume' listos")
    for (let i = 0; i < filtroPromocionPre_Negotiated.length; i++) {
        const callItemPromotion = await axios({
            method: "get",
            url: `https://api.mercadolibre.com/seller-promotions/promotions/${filtroPromocionPre_Negotiated[i].id}/items?promotion_type=${filtroPromocionPre_Negotiated[i].type}`,
            headers: head
        })
        const respuestaItemPromotion = callItemPromotion.data.results
        if(respuestaItemPromotion){
            arrayPre_Negotiated.push(...respuestaItemPromotion)
        }else{
            console.log("Upa, un array vacío")
        }
    }
    console.log("Productos con oferta 'Pre_Negotiated' listos")
    for (let i = 0; i < filtroPromocionDOD.length; i++) {
        const callItemPromotion = await axios({
            method: "get",
            url: `https://api.mercadolibre.com/seller-promotions/promotions/${filtroPromocionDOD[i].id}/items?promotion_type=${filtroPromocionDOD[i].type}`,
            headers: head
        })
        const respuestaItemPromotion = callItemPromotion.data.results
        if(respuestaItemPromotion){
            arrayDOD.push(...respuestaItemPromotion)
        }else{
            console.log("Upa, un array vacío")
        }
    }
    console.log("Productos con oferta 'DOD' listos")
    for (let i = 0; i < filtroPromocionLightning.length; i++) {
        const callItemPromotion = await axios({
            method: "get",
            url: `https://api.mercadolibre.com/seller-promotions/promotions/${filtroPromocionLightning[i].id}/items?promotion_type=${filtroPromocionLightning[i].type}`,
            headers: head
        })
        const respuestaItemPromotion = callItemPromotion.data.results
        if(respuestaItemPromotion){
            arrayLightning.push(...respuestaItemPromotion)
        }else{
            console.log("Upa, un array vacío")
        }
    }
    console.log("Productos con oferta 'Lightning' listos")
     */

        //console.log(structuraFinal);
        //console.log("STOP");
        //console.log(prueba);
        /* promotionType,
        id,
        status,
        original_price,
        price,
        offer_id,
        meli_percentage,
        seller_percentage,
        start_date,
        end_date,
        Timestamp */
        /* if(respuestaItemPromotion){
            arrayAPushearData.push(
                ...respuestaItemPromotion
            )
        }else{
            
            console.log("Upa, un array vacío");
        } */
        //console.log(arrayAPushearData);
/* for (let i = 0; i < filtroPromocionPrice_Discount.length; i++) {
        const callItemPromotion = await axios({
            method: "get",
            url: `https://api.mercadolibre.com/seller-promotions/promotions/${filtroPromocionPrice_Discount[i].id}/items?promotion_type=${filtroPromocionPrice_Discount[i].type}`,
            headers: head
        })
        const respuestaItemPromotion = callItemPromotion.data.results
        console.log(respuestaItemPromotion);

        if(respuestaItemPromotion){
            arrayPrice_Discount.push(...respuestaItemPromotion)
        }else{
            console.log("Upa, un array vacío")
        }
    } */
/* for (let i = 0; i < filtroPromocionDEAL.length; i++) {
        
        const callItemPromotion = await axios({
            method: "get",
                    //console.log(arrayContenedorCoFondeoTotal);
        //Export al Sheet
//        console.log(arrayeMarketPlace_Campaign_Data);
            url: `https://api.mercadolibre.com/seller-promotions/promotions/${filtroPromocionDEAL[i].id}/items?promotion_type=${filtroPromocionDEAL[i].type}`,
            headers: head
        })
        const respuestaItemPromotion = callItemPromotion.data.results
        console.log(respuestaItemPromotion);
        if(respuestaItemPromotion){
            arrayDEAL.push(...respuestaItemPromotion)
        }else{
            
            console.log("Upa, un array vacío");
        }
    } */
    /* for (let i = 0; i < filtroPromocionMarketPlaceCampaign.length; i++) {
        const callItemPromotion = await axios({
            method: "get",
            url: `https://api.mercadolibre.com/seller-promotions/promotions/${filtroPromocionMarketPlaceCampaign[i].id}/items?promotion_type=${filtroPromocionMarketPlaceCampaign[i].type}`,
            headers: head
        })
        const respuestaItemPromotion = callItemPromotion.data.results
        if(respuestaItemPromotion){
            arrayMarketPlace_Campaign.push(...respuestaItemPromotion)
        }else{
            console.log("Upa, un array vacío")
        }
    } */
/* (async () =>{
        
        async function exportaSheet(){
            const documento = new GoogleSpreadsheet(googleId);
            await documento.useServiceAccountAuth(credenciales);
            await documento.loadInfo();
            
            const sheet =documento.sheetsByTitle['main'];                                           //Selecciona la hoja a la cual plasmará el contenido, el valor se lo pasa por parámetro para no repetir
            await sheet.clearRows();                                                                //Limpia las columnas
            await sheet.addRows(arrayContenedorCoFondeoTotal);                                           //Añade la información del array
            
        };
        //Una vez que haya extraido toda la info de los productos disponibles, lo plasma en el Sheet
        console.log('***Importando datos a spreadsheet de CO Fondeo ***');
        //Ejecuta el código y muestra los datos en el sheet
        exportaSheet()
        console.log("***Finalizó proceso importación de CO Fondeo ***");
    })(); */
    /* 
    const now         = new Date();
    const nowNumber   = now.getTime();
    const horas       = now.getHours();
    const minutos     = ("0" + now.getMinutes() ).slice(-2);  //Esto para que el formato de minuto sea "09" y no "9"
    const horaMinuto  = " " + horas + ":" + minutos;
    const dia         = ("0" + now.getDate()).slice(-2);      //Esto para que el formato de hora sea "09" y no "9"
    const anio        = now.getFullYear();
    const mes         = now.getMonth() + 1;
    const hora_hoy    = dia + "/" + mes + "/" + anio;
    const date        = horaMinuto + " " + hora_hoy;
    CLEAN THIS
    let responseCoFondeo = await axios({                                                    //Hacemos la llamada para optener todas las promociones por Usuario
        method: "get",
        url: "https://api.mercadolibre.com/seller-promotions/users/113746522",
        headers: head
    }) */
    /* for (let i = 0; i < arrayDEAL.length; i++) {
        tmp.promotionType = "DEAL";
        tmp.id = arrayDEAL[i]?.id;
        tmp.status = arrayDEAL[i]?.status;
        tmp.original_price = arrayDEAL[i]?.original_price;
        tmp.price = arrayDEAL[i]?.price;
        tmp.offer_id = arrayDEAL[i]?.offer_id;
        tmp.meli_percentage = arrayDEAL[i]?.meli_percentage;
        tmp.seller_percentage = arrayDEAL[i]?.seller_percentage;
        tmp.start_date = arrayDEAL[i]?.start_date?.split('T')[0];
        tmp.end_date =  arrayDEAL[i]?.end_date?.split('T')[0];
        const horasString =horas.toString();
    const unaHoraMenos = horasString -1
    const unaHoraMenosString = unaHoraMenos.toString();
    const horaMinutoUnaHoraMenos  = unaHoraMenos + ":" + minutos;   //Utilizar esto cuando se mande el código a Pablo
    const hora_hoy_String = hora_hoy.toString()
        arrayContenedorCoFondeoTotal.push({
            promotionType:tmp.promotionType,
            id:tmp.id,
            status:tmp.status,
            original_price:tmp.original_price,
            price:tmp.price,
            offer_id:tmp.offer_id,
            meli_percentage:tmp.meli_percentage,
            seller_percentage:tmp.seller_percentage,
            start_date:tmp.start_date,
            end_date:tmp.end_date,
            Timestamp: date,
        })
    } */
    /* 
    // arrayMarketPlace_Campaign
    for (let i = 0; i < arrayMarketPlace_Campaign.length; i++) {
    tmp.promotionType = "MARKETPLACE_CAMPAIGN";
        tmp.id = arrayMarketPlace_Campaign[i]?.id;
        tmp.status = arrayMarketPlace_Campaign[i]?.status;
        tmp.original_price = arrayMarketPlace_Campaign[i]?.original_price;
        tmp.price = arrayMarketPlace_Campaign[i]?.price;
        tmp.offer_id = arrayMarketPlace_Campaign[i]?.offer_id;
        tmp.meli_percentage = arrayMarketPlace_Campaign[i]?.meli_percentage;
        tmp.seller_percentage = arrayMarketPlace_Campaign[i]?.seller_percentage;
        tmp.start_date = arrayMarketPlace_Campaign[i]?.start_date?.split('T')[0];
        tmp.end_date = arrayMarketPlace_Campaign[i]?.end_date?.split('T')[0];
        
        arrayContenedorCoFondeoTotal.push({
            promotionType:tmp.promotionType,
            id:tmp.id,
            status:tmp.status,
            original_price:tmp.original_price,
            price:tmp.price,
            offer_id:tmp.offer_id,
            meli_percentage:tmp.meli_percentage,
            seller_percentage:tmp.seller_percentage,
            start_date:tmp.start_date,
            end_date:tmp.end_date,
            Timestamp: date,
        })
    }

    //A CORROBORAR array "arrayPrice_DiscountProductos"
    // arrayPrice_Discount
    for (let i = 0; i < arrayPrice_Discount.length; i++) {
        tmp.promotionType = "PRICE DISCOUNT";
        tmp.id = arrayPrice_Discount[i]?.id;
        tmp.status = arrayPrice_Discount[i]?.status;
        tmp.original_price = arrayPrice_Discount[i]?.original_price;
        tmp.price = arrayPrice_Discount[i]?.price;
        tmp.offer_id = arrayPrice_Discount[i]?.offer_id;
        tmp.meli_percentage = arrayPrice_Discount[i]?.meli_percentage;
        tmp.seller_percentage = arrayPrice_Discount[i]?.seller_percentage;
        tmp.start_date = arrayPrice_Discount[i]?.start_date?.split('T')[0];
        tmp.end_date = arrayPrice_Discount[i]?.end_date?.split('T')[0];
        
        arrayContenedorCoFondeoTotal.push({
            promotionType:tmp.promotionType,
            id:tmp.id,
            status:tmp.status,
            original_price:tmp.original_price,
            price:tmp.price,
            offer_id:tmp.offer_id,
            meli_percentage:tmp.meli_percentage,
            seller_percentage:tmp.seller_percentage,
            start_date:tmp.start_date,
            end_date:tmp.end_date,
            Timestamp: date,
        })
    }
    // arrayVolume
    for (let i = 0; i < arrayVolume.length; i++) {
        tmp.promotionType = "VOLUME";
        tmp.id = arrayVolume[i]?.id;
        tmp.status = arrayVolume[i]?.status;
        tmp.original_price = arrayVolume[i]?.original_price;
        tmp.price = arrayVolume[i]?.price;
        tmp.offer_id = arrayVolume[i]?.offer_id;
        tmp.meli_percentage = arrayVolume[i]?.meli_percentage;
        tmp.seller_percentage = arrayVolume[i]?.seller_percentage;
        tmp.start_date = arrayVolume[i]?.start_date.split('T')[0];
        tmp.end_date = arrayVolume[i]?.end_date.split('T')[0];
        
        arrayContenedorCoFondeoTotal.push({
            promotionType:tmp.promotionType,
            id:tmp.id,
            status:tmp.status,
            original_price:tmp.original_price,
            price:tmp.price,
            offer_id:tmp.offer_id,
            meli_percentage:tmp.meli_percentage,
            seller_percentage:tmp.seller_percentage,
            start_date:tmp.start_date,
            end_date:tmp.end_date,
            Timestamp: date,
        })
    }
    // arrayPre_Negotiated
    for (let i = 0; i < arrayPre_Negotiated.length; i++) {
        
        tmp.promotionType = "PRE_NEGOTIATED";
        tmp.id = arrayPre_Negotiated[i]?.id;
        tmp.status = arrayPre_Negotiated[i]?.status;
        tmp.original_price = arrayPre_Negotiated[i]?.original_price;
        tmp.price = arrayPre_Negotiated[i]?.price;
        tmp.offer_id = arrayPre_Negotiated[i]?.offer_id;
        tmp.meli_percentage = arrayPre_Negotiated[i]?.meli_percentage;
        tmp.seller_percentage = arrayPre_Negotiated[i]?.seller_percentage;
        tmp.start_date = arrayPre_Negotiated[i]?.start_date?.split('T')[0];
        tmp.end_date = arrayPre_Negotiated[i]?.end_date?.split('T')[0];
        
        arrayContenedorCoFondeoTotal.push({
            promotionType:tmp.promotionType,
            id:tmp.id,
            status:tmp.status,
            original_price:tmp.original_price,
            price:tmp.price,
            offer_id:tmp.offer_id,
            meli_percentage:tmp.meli_percentage,
            seller_percentage:tmp.seller_percentage,
            start_date:tmp.start_date,
            end_date:tmp.end_date,
            Timestamp: date,
        })
    }
    const PushingInformation = (arrayARecorrer, tipoDeOferta, nombreDelObjeto, arrayContenedorFinal, arrayInicial) =>{
    try{
        //Y dsp, acá pisar y reemplazar los valores
         Limpiar esto, y hacer que en vez de crear valores nuevos, que simplemente pise los que ya están inicializados
        for (let i = 0; i < arrayARecorrer.length; i++) {
            nombreDelObjeto.promotionType = tipoDeOferta;
            nombreDelObjeto.id = arrayARecorrer[i]?.id;
            nombreDelObjeto.status = arrayARecorrer[i]?.status;
            nombreDelObjeto.original_price = arrayARecorrer[i]?.original_price;
            nombreDelObjeto.price = arrayARecorrer[i]?.price;
            nombreDelObjeto.offer_id = arrayARecorrer[i]?.offer_id;
            nombreDelObjeto.meli_percentage = arrayARecorrer[i]?.meli_percentage;
            nombreDelObjeto.seller_percentage = arrayARecorrer[i]?.seller_percentage;
            nombreDelObjeto.start_date = arrayARecorrer[i]?.start_date?.split('T')[0];
            nombreDelObjeto.end_date =  arrayARecorrer[i]?.end_date?.split('T')[0];
            
            arrayContenedorFinal.push({
                promotionType:nombreDelObjeto.promotionType,
                id:nombreDelObjeto.id,
                status:nombreDelObjeto.status,
                original_price:nombreDelObjeto.original_price,
                price:nombreDelObjeto.price,
                offer_id:nombreDelObjeto.offer_id,
                meli_percentage:nombreDelObjeto.meli_percentage,
                seller_percentage:nombreDelObjeto.seller_percentage,
                start_date:nombreDelObjeto.start_date,
                end_date:nombreDelObjeto.end_date,
                Timestamp: dateToday().date,
            })
            if(i == (arrayARecorrer.length - 1)){
                return arrayContenedorFinal
            }
        }
    }catch(error){
        console.log(error);
    }
    }
    // arrayDOD
    for (let i = 0; i < arrayDOD.length; i++) {
        tmp.promotionType = "DOD";
        tmp.id = arrayDOD[i]?.id;
        tmp.status = arrayDOD[i]?.status;
        tmp.original_price = arrayDOD[i]?.original_price;
        tmp.price = arrayDOD[i]?.price;
        tmp.offer_id = arrayDOD[i]?.offer_id;
        tmp.meli_percentage = arrayDOD[i]?.meli_percentage;
        tmp.seller_percentage = arrayDOD[i]?.seller_percentage;
        tmp.start_date = arrayDOD[i]?.start_date?.split('T')[0];
        tmp.end_date = arrayDOD[i]?.finish_date?.split('T')[0];
        
        arrayContenedorCoFondeoTotal.push({
            promotionType:tmp.promotionType,
            id:tmp.id,
            status:tmp.status,
            original_price:tmp.original_price,
            price:tmp.price,
            offer_id:tmp.offer_id,
            meli_percentage:tmp.meli_percentage,
            seller_percentage:tmp.seller_percentage,
            start_date:tmp.start_date,
            end_date:tmp.end_date,
            Timestamp: date,
        })
    }
    // arrayLightning
    for (let i = 0; i < arrayLightning.length; i++) {
        tmp.promotionType = "LIGHTNING";
        tmp.id = arrayLightning[i]?.id;
        tmp.status = arrayLightning[i]?.status;
        tmp.original_price = arrayLightning[i]?.original_price;
        tmp.price = arrayLightning[i]?.price;
        tmp.offer_id = arrayLightning[i]?.offer_id;
        tmp.meli_percentage = arrayLightning[i]?.meli_percentage;
        tmp.seller_percentage = arrayLightning[i]?.seller_percentage;
        tmp.start_date = arrayLightning[i]?.start_date?.split('T')[0];
        tmp.end_date = arrayLightning[i]?.finish_date?.split('T')[0];
        
        arrayContenedorCoFondeoTotal.push({
            promotionType:tmp.promotionType,
            id:tmp.id,
            status:tmp.status,
            original_price:tmp.original_price,
            price:tmp.price,
            offer_id:tmp.offer_id,
            meli_percentage:tmp.meli_percentage,
            seller_percentage:tmp.seller_percentage,
            start_date:tmp.start_date,
            end_date:tmp.end_date,
            Timestamp: date,
        })
    }  */
    /* for (let i = 0; i < arrayDEAL.length; i++) {
        tmp.promotionType = "DEAL";
        tmp.id = arrayDEAL[i]?.id;
        tmp.status = arrayDEAL[i]?.status;
        tmp.original_price = arrayDEAL[i]?.original_price;
        tmp.price = arrayDEAL[i]?.price;
        tmp.offer_id = arrayDEAL[i]?.offer_id;
        tmp.meli_percentage = arrayDEAL[i]?.meli_percentage;
        tmp.seller_percentage = arrayDEAL[i]?.seller_percentage;
        tmp.start_date = arrayDEAL[i]?.start_date?.split('T')[0];
        tmp.end_date =  arrayDEAL[i]?.end_date?.split('T')[0];
        
        arrayContenedorCoFondeoTotal.push({
            promotionType:tmp.promotionType,
            id:tmp.id,
            status:tmp.status,
            original_price:tmp.original_price,
            price:tmp.price,
            offer_id:tmp.offer_id,
            meli_percentage:tmp.meli_percentage,
            seller_percentage:tmp.seller_percentage,
            start_date:tmp.start_date,
            end_date:tmp.end_date,
            Timestamp: date,
        })
    } */

        //console.log(arrayLightning_Data);
        //console.log("HASTA ACÁ BIEN");
        //Por último, se recorre el array con la info según la promoción, y se le especifica su tipo, y se le añade la fecha y hora de hoy
        // arrayDEAL
        //Parámetros: array al cual recorrer, nombreDelObjeto, arrayContenedorFinal
        
        /* await PushingInformation(arrayDEAL_Data,"DEAL",tmp,arrayContenedorCoFondeoTotal, filtroPromocionDEAL)
        await PushingInformation(arrayeMarketPlace_Campaign_Data,"MARKETPLACE_CAMPAIGN",tmp,arrayContenedorCoFondeoTotal, filtroPromocionMarketPlaceCampaign)
        await PushingInformation(arrayPrice_Discount_Data,"PRICE DISCOUNT",tmp,arrayContenedorCoFondeoTotal, filtroPromocionPrice_Discount)
        await PushingInformation(arrayVolume_Data,"VOLUME",tmp,arrayContenedorCoFondeoTotal, filtroPromocionVolume)
        await PushingInformation(arrayPre_Negotiated_Data,"PRE_NEGOTIATED",tmp,arrayContenedorCoFondeoTotal, filtroPromocionPre_Negotiated)
        await PushingInformation(arrayDOD_Data,"DOD",tmp,arrayContenedorCoFondeoTotal, filtroPromocionDOD)
        await PushingInformation(arrayLightning_Data,"LIGHTNING",tmp,arrayContenedorCoFondeoTotal, filtroPromocionLightning)
         */
    //Convendría crear acá el array completo, con los valores vacios
        //console.log(respuestaItemPromotion);
        //let structuraFinal = []
        //console.log(respuestaItemPromotion.length);
        //let prueba = [...respuestaItemPromotion]

        /* 
        PARECE QUE FUNCIONA
        Ahora lo que queda es, definir la info que queremos extraer por afuera.
        Luego, definir los valores vacíos para llenarlo en la otra función
        */

        //En teoría acá ya puedo tener todos los arrays, dsp es cuestión de pushearlo a un solo array, así que en teoría acá deben estar todos
        // NOTA: Recordá que hay algunas promociones que tienen menos características, ej, DEAL, y por ende van a tener valor undefined