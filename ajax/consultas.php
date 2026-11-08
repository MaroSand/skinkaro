<?php 
require_once "../modelos/Consultas.php";

$consulta=new Consultas();

switch ($_GET["op"]){
	case 'comprasfecha':
		$fecha_inicio=$_REQUEST["fecha_inicio"];
		$fecha_fin=$_REQUEST["fecha_fin"];
		$rspta=$consulta->comprasfecha($fecha_inicio,$fecha_fin);
 		//Vamos a declarar un array
 		$data= Array();

 		while ($reg=$rspta->fetch_object()){
 			$data[]=array(
 				"0"=>$reg->fecha,
 				"1"=>$reg->usuario,
 				"2"=>$reg->proveedor,
				"3"=>$reg->tipo_comprobante,
 				"4"=>$reg->serie_comprobante.' '.$reg->num_comprobante,
 				"5"=>$reg->total_compra,
 				"6"=>$reg->impuesto,
 			    "7"=>($reg->estado=='Aceptado')?'<span class="label bg-green">Aceptado</span>':
 				'<span class="label bg-red">Anulado</span>'
 				);
 		}
 		$results = array(
 			"sEcho"=>1, //Información para el datatables
 			"iTotalRecords"=>count($data), //enviamos el total registros al datatable
 			"iTotalDisplayRecords"=>count($data), //enviamos el total registros a visualizar
 			"aaData"=>$data);
 		echo json_encode($results);

	break;

	case 'ventasfechacliente':
		$fecha_inicio=isset($_REQUEST["fecha_inicio"])? limpiarCadena($_REQUEST["fecha_inicio"]):"";
		$fecha_fin=isset($_REQUEST["fecha_fin"])? limpiarCadena($_REQUEST["fecha_fin"]):"";
		$idcliente=isset($_REQUEST["idcliente"])? limpiarCadena($_REQUEST["idcliente"]):"";
		$origen=isset($_REQUEST["origen"])? limpiarCadena($_REQUEST["origen"]):"";
		$rspta=$consulta->ventasfechacliente($fecha_inicio,$fecha_fin,$idcliente);
 		//Vamos a declarar un array
 		$data= Array();

 		while ($reg=$rspta->fetch_object()){
 			//Filtramos por origen: "web" = pedidos de la tienda online (serie WEB) | "local" = ventas del sistema
 			$esWeb=($reg->serie_comprobante=='WEB');
 			if (($origen=='web' && !$esWeb) || ($origen=='local' && $esWeb))
 			{
 				continue;
 			}
 			$etiquetaWeb=$esWeb?' <span class="label bg-orange">Tienda web</span>':'';

 			$data[]=array(
 				"0"=>$reg->fecha,
 				"1"=>$reg->usuario,
 				"2"=>$reg->cliente,
				"3"=>$reg->tipo_comprobante,
 				"4"=>$reg->serie_comprobante.' '.$reg->num_comprobante.$etiquetaWeb,
 				"5"=>$reg->total_venta,
 				"6"=>$reg->impuesto,
 			    "7"=>($reg->estado=='Aceptado')?'<span class="label bg-green">Aceptado</span>':
 				'<span class="label bg-red">Anulado</span>'
 				);
 		}
 		$results = array(
 			"sEcho"=>1, //Información para el datatables
 			"iTotalRecords"=>count($data), //enviamos el total registros al datatable
 			"iTotalDisplayRecords"=>count($data), //enviamos el total registros a visualizar
 			"aaData"=>$data);
 		echo json_encode($results);

	break;
}
?>