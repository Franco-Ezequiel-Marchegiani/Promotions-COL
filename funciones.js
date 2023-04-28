import  { GoogleSpreadsheet } from 'google-spreadsheet';
import axios from 'axios';
import fs, {promises} from 'fs'; 
import {readFile} from 'fs/promises'
const dateToday = (paramPosibleFecha, numeroHorasARestar)=>{
    /* Horarios */
    let now         = new Date(paramPosibleFecha);
    let nowNumber   = now.getTime();
    let horas       = now.getHours();
    let minutos     = ("0" + now.getMinutes() ).slice(-2);                                      //Esto para que el formato de minuto sea "09" y no "9"
    let seconds     = ("0" + now.getSeconds() ).slice(-2);
    let horaMinuto  = " " + horas + ":" + minutos + ":" + seconds;
    let dia         = ("0" + now.getDate()).slice(-2);                                          //Esto para que el formato de hora sea "09" y no "9"
    let anio        = now.getFullYear();
    let mes         = now.getMonth() + 1;
    let hora_hoy    = dia + "/" + mes + "/" + anio;
    let date        = hora_hoy + " " + horaMinuto;
    let completeDate = hora_hoy + " " + date

    
    //Código por si se tiene que restar horas por diferencia horaria
    let horaMls     = (numeroHorasARestar * 60) * 60000
    let nowMenosHoras = new Date(nowNumber - horaMls);
    let horasMenosHoras       = nowMenosHoras.getHours();
    let minutosMenosHoras     = ("0" + nowMenosHoras.getMinutes() ).slice(-2);                                      //Esto para que el formato de minuto sea "09" y no "9"
    let secondsMenosHoras     = ("0" + nowMenosHoras.getSeconds() ).slice(-2);
    let horaMinutoMenosHoras  = " " + horasMenosHoras + ":" + minutosMenosHoras + ":" + secondsMenosHoras;
    let diaMenosHoras         = ("0" + nowMenosHoras.getDate()).slice(-2);                                          //Esto para que el formato de hora sea "09" y no "9"
    let anioMenosHoras        = nowMenosHoras.getFullYear();
    let mesMenosHoras         = nowMenosHoras.getMonth() + 1;
    let hora_hoyMenosHoras    = diaMenosHoras + "/" + mesMenosHoras + "/" + anioMenosHoras;
    let dateMenosHoras        = hora_hoyMenosHoras + " : " + horaMinutoMenosHoras + " : " + secondsMenosHoras;
    let completeDateMenosHoras = hora_hoyMenosHoras + " " + dateMenosHoras
    return {now, nowNumber, nowMenosHoras, horas, minutos, horaMinuto, dia, anio, mes, hora_hoy, date, completeDate, horasMenosHoras,minutosMenosHoras,secondsMenosHoras,horaMinutoMenosHoras,diaMenosHoras,anioMenosHoras,mesMenosHoras,hora_hoyMenosHoras,dateMenosHoras, completeDateMenosHoras}
    
}
const exportSheet = async (googleID, credencialesSheet, title, data) =>{
    const documento = new GoogleSpreadsheet(googleID);
    await documento.useServiceAccountAuth(credencialesSheet);                
    await documento.loadInfo();

    const sheet = documento.sheetsByTitle[title];                                               //Selecciona la hoja a la cual plasmará el contenido, el valor se lo pasa por parámetro para no repetir
    await sheet.clearRows();                                                                    //Limpia las columnas                
    
    await sheet.addRows(data);                                                                  //Añade la información del array                
};

const llamadaAPI = async(methodType, url, head, params)=>{
    let apiCall = await axios({
            method: methodType,
            url: url,       //Se pasa por la url el número de offset actualizado, acorde a cada vuelta "https://api.mercadolibre.com/sites/MLA/search?seller_id=394109866"
            headers: head, 
            params: params
    }).catch(function (error) { 
        console.log("Nada por aquí mi loco");
    }); 
    return apiCall;
}
const FilterByPromotionBucle = async(arrayARecorrer,arrayAPushearData, head)=>{
    let now         = new Date();
    for (let i = 0; i < arrayARecorrer.length; i++) {
        const callItemPromotion = await llamadaAPI("get",`https://api.mercadolibre.com/seller-promotions/promotions/${arrayARecorrer[i].id}/items?promotion_type=${arrayARecorrer[i].type}`,head)
        const respuestaItemPromotion = callItemPromotion?.data?.results

        //console.log(respuestaItemPromotion);
        let pruebaTodosItems = []
        if (respuestaItemPromotion) {
                pruebaTodosItems.push(...respuestaItemPromotion) 
        }
        console.log(pruebaTodosItems);
        //console.log(pruebaTodosItems);
        for (let indexChikito = 0; indexChikito < pruebaTodosItems.length; indexChikito++) {
            arrayAPushearData.push({
                    idPromotion: arrayARecorrer[i]?.id,
                    typePromotion: arrayARecorrer[i]?.type,
                    deadline_date: arrayARecorrer[i]?.deadline_date,
                    name: arrayARecorrer[i]?.name,
                    benefits_type: arrayARecorrer[i]?.benefits?.type,
                    benefits_meliPercent: arrayARecorrer[i]?.benefits?.meli_percent,
                    benefits_sellerPercent: arrayARecorrer[i]?.benefits?.seller_percent,
                    idItem: pruebaTodosItems[indexChikito]?.id,
                    status: pruebaTodosItems[indexChikito]?.status,
                    price: pruebaTodosItems[indexChikito]?.price,
                    original_price: pruebaTodosItems[indexChikito]?.original_price,
                    offer_id: pruebaTodosItems[indexChikito]?.offer_id,
                    meli_percentage: pruebaTodosItems[indexChikito]?.meli_percentage,
                    seller_percentage: pruebaTodosItems[indexChikito]?.seller_percentage,
                    start_date: pruebaTodosItems[indexChikito]?.start_date ? pruebaTodosItems[indexChikito]?.start_date : "",
                    end_date: pruebaTodosItems[indexChikito]?.end_date ? pruebaTodosItems[indexChikito]?.end_date : "",
                    Timestamp: dateToday(now).date,
                });
            
        }
        if(i == (arrayARecorrer.length - 1)){
             //console.log(prueba);
             console.log(arrayAPushearData);
             console.log(arrayAPushearData.length);
             console.log("STOP ITTTT!");
            
            return arrayAPushearData
        }
    }
}

const savingData = async(arrayConDatos, nombreArchivoCSV)=>{
        //let headers = Object.keys(arrayConDatos[0] || {}).join(' | ');

        let respuestaData = arrayConDatos?.map ((elementos) => { //solo accedemos a id y name de la respuesta a traves de map
                return {
                    idPromotion: elementos?.idPromotion,
                    typePromotion: elementos?.typePromotion,
                    deadline_date: elementos?.deadline_date,
                    name: elementos?.name,
                    benefits_type: elementos?.benefits_type,
                    benefits_meliPercent: elementos?.benefits_meliPercent,
                    benefits_sellerPercent: elementos?.benefits_sellerPercent,
                    idItem: elementos?.idItem,
                    status: elementos?.status,
                    price: elementos?.price,
                    original_price: elementos?.original_price,
                    offer_id: elementos?.offer_id,
                    meli_percentage: elementos?.meli_percentage,
                    seller_percentage: elementos?.seller_percentage,
                    start_date: elementos?.start_date,
                    end_date: elementos?.end_date,
                    Timestamp: elementos?.Timestamp,
                }
        }).map((elementos) => Object?.values(elementos)?.join(' | ')) // tomamos solos los valores y los separamos con comas
        .join('\n'); // le damos un salto de linea
        //En este array sumamos los headers, un salto de linea, y los productos

        //En este array sumamos un salto de linea, y los productos 
        const arrayInCSVFormat = ['\n',respuestaData];
        await fs.promises.appendFile(`./data/${nombreArchivoCSV}.csv`, arrayInCSVFormat);
}
const getDataCSV = async (nombreArchivoCSV) =>{
    let nombreArrayConInfo = []
    const readingFile = (await readFile(`./data/${nombreArchivoCSV}.csv`)).toString();  //Obtenemos la info del archivo CSV y se pasa a String
    const splitFile = readingFile.split("\n")                               //Separamos los objetos con un espacio
    const [header, ...files] =splitFile                                     //Obtenemos la info guardada en un array
    for(const i of files){                                                  //Recorremos el largo de "files"
    const splitFiles = i.split("|")                                     //Usamos el separador de "|" para obtener cada dato certero
    
    nombreArrayConInfo.push({
        //Y acá va la info a extraer
        idPromotion: splitFiles[0],
        typePromotion: splitFiles[1],
        deadline_date: splitFiles[2],
        name: splitFiles[3],
        benefits_type: splitFiles[4],
        benefits_meliPercent: splitFiles[5],
        benefits_sellerPercent: splitFiles[6],
        idItem: splitFiles[7],
        status: splitFiles[8],
        price: splitFiles[9],
        original_price: splitFiles[10],
        offer_id: splitFiles[11],
        meli_percentage: splitFiles[12],
        seller_percentage: splitFiles[13],
        start_date: splitFiles[14],
        end_date: splitFiles[15],
        Timestamp: splitFiles[16],
    })
    }
    return nombreArrayConInfo
};
//Exportamos un objeto, y adentro mencionamos las variables con funciones las cuales exportamos
export {exportSheet, llamadaAPI, FilterByPromotionBucle, savingData, getDataCSV}