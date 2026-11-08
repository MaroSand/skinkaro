    <footer class="main-footer">
        <div class="pull-right hidden-xs">
          <b>Version</b> 1.1.0
        </div>
        <strong>Copyright &copy; 2013-2025 <a href="www.gp.edu.ar">ITVentasSP</a>.</strong> All rights reserved.
    </footer>    
    <!-- jQuery 2.1.4 -->
    <script src="../public/js/jquery-3.1.1.min.js"></script>
    <!-- Bootstrap 3.3.5 -->
    <script src="../public/js/bootstrap.min.js"></script>
    <!-- AdminLTE App -->
    <script src="../public/js/app.min.js"></script>
    <!--datatables-->
    <script src="../public/datatables/jquery.dataTables.min.js"></script>
    <script src="../public/datatables/buttons.colVis.min.js"></script>
    <script src="../public/datatables/buttons.html5.min.js"></script>
    <script src="../public/datatables/dataTables.buttons.min.js"></script>
    <script src="../public/datatables/jszip.min.js"></script>
    <script src="../public/datatables/pdfmake.min.js"></script>
    <script src="../public/datatables/vfs_fonts.js"></script>
    <script src="../public/js/bootbox.min.js"></script>

    <script src="../public/js/bootstrap-select.min.js"></script>
    <script>
      // Si la sesión expiró (401), volver al login
      $(document).ajaxError(function (event, xhr) {
        if (xhr.status === 401) { window.location.href = "login.html"; }
      });
    </script>
  </body>
</html>