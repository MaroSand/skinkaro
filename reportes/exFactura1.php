<?php
//Activamos el almacenamiento en el buffer
ob_start();
if (strlen(session_id()) < 1) 
  session_start();

if (!isset($_SESSION["nombre"]))
{
  echo 'Debe ingresar al sistema correctamente para visualizar el reporte';
}
else
{
if ($_SESSION['ventas']==1)
{
	require ('Factura.php');
	//Establecemos los datos de la empresa
	$logo = "logo.jpg";
	$ext_logo ="jpg";
	$empresa = "Soluciones Innovadoras S.A. Argentina";
	$documento = "20266065508";
	$direccion = "San Martín 721 - Pcia R. Sáenz Peña - Chaco";
	$telefono = "3644420268";
	$email = "gustavopaszco@yahoo.com.ar";
	//obtener los datos de la cabecera de la venta actual
	require_once "../modelos/Venta.php";
	$venta = new Venta();
	$rsptav = $venta->ventacabecera($_GET["id"]);
	//recorremos todos los valores obtenidos
	$regv=$rsptav->fetch_object();
	//establecemos la configuración de la factura
	$pdf = new PDF_Invoice( 'P', 'mm', 'A4' );
	$pdf->AddPage();

	//enviamos los datos de la empresa al método addSociete de la clase factura

	$pdf->addSociete($empresa,
						$documento."\n"  .
						"Dirección: ".$direccion."\n".
						"teléfono: ".$telefono. "\n" .
						"Email: ".$email,$logo,$ext_logo);
	$pdf->fac_dev("$regv->tipo_comprobante","$regv->serie_comprobante","$regv->num_comprobante");
	$pdf->temporaire( "" );
	$pdf->addDate($regv->fecha);
	//enviamos los datos del cliente al método addClientAdresse de la clase Factura
	$pdf->addClientAdresse(utf8_decode($regv->cliente),"Domicilio: ",utf8_decode($regv->direccion),$regv->tipo_documento.": ".$regv->num_documento,"Email: ".$regv->email,"Teléfono: ".$regv->telefono);
	//Establecemos las columnas que va a tener la sección donde mostramos los detalles de la venta
	$cols=array( "CODIGO"=>23,
             "DESCRIPCION"=>78,
             "CANTIDAD"=>22,
             "P.U."=>25,
             "DSCTO"=>20,
             "SUBTOTAL"=>22);
	$pdf->addCols( $cols);
	$cols=array( "CODIGO"=>"L",
             "DESCRIPCION"=>"L",
             "CANTIDAD"=>"C",
             "P.U."=>"R",
             "DSCTO" =>"R",
             "SUBTOTAL"=>"C");
	$pdf->addLineFormat( $cols);
	$pdf->addLineFormat($cols);
	//Actualizamos el valor de la coordenada "y", que será la ubicación desde donde empezaremos a mostrar los datos
	$y= 89;
	//Obtenemos todos los detalles de la venta actual
	$rsptad = $venta->ventadetalle($_GET["id"]);
 
	while ($regd = $rsptad->fetch_object()) {
  		$line = array( "CODIGO"=> "$regd->codigo",
                "DESCRIPCION"=> utf8_decode("$regd->articulo"),
                "CANTIDAD"=> "$regd->cantidad",
                "P.U."=> "$regd->precio_venta",
                "DSCTO" => "$regd->descuento",
                "SUBTOTAL"=> "$regd->subtotal");
            $size = $pdf->addLine( $y, $line );
            $y   += $size + 2;
	}
 
	//Convertimos el total en letras
	require_once "Letras.php";
	$V=new EnLetras(); 
	$con_letra=strtoupper($V->ValorEnLetras($regv->total_venta,"PESOS"));
	$pdf->addCadreTVAs("---".$con_letra);
 
	//Mostramos el impuesto
	$pdf->addTVAs( $regv->impuesto, $regv->total_venta,"S/ ");
	$pdf->addCadreEurosFrancs("IGV"." $regv->impuesto %");
	$pdf->Output('Reporte de Venta','I');
}
else
	{
  		echo 'No tiene permiso para visualizar el reporte';
	}


}
ob_end_flush();
?>