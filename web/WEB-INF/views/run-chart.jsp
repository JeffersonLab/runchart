<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <title>EPICS CA Run Chart</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/run-chart.css?v=${initParam.releaseNumber}"/>
        <link rel="stylesheet" type="text/css" href="/epics2web/resources/css/epics2web.css?v=${initParam.epics2webReleaseNumber}"/>        
    </head>
    <body>
        <div id="chrome">
            <div class="subpanel"> 
                <h1>EPICS CA Run Chart (v${initParam.releaseNumber})</h1>
            </div>
            <div class="subpanel">
                <input type="text" id="pv-input" placeholder="PV Name"/>
                <button type="button" id="go-button">➜</button>
                <img class="ws-disconnected" alt="Disconnected" title="Socket Disconnected" width="24" height="24" src="/epics2web/resources/img/disconnected.svg"/>
                <img class="ws-connecting connecting-spinner" alt="Connecting" title="Socket Connecting" width="24" height="24" src="/epics2web/resources/img/connecting.svg"/>                
                <img class="ws-connected" alt="Connected" title="Socket Connected" width="24" height="24" src="/epics2web/resources/img/connected.svg"/>
            </div>
        </div>
        <div id="chart-holder"></div>
        <script type="text/javascript" src="/epics2web/resources/js/jquery-1.10.2.min.js"></script>
        <script type="text/javascript" src="/epics2web/resources/js/epics2web.js?v=${initParam.epics2webReleaseNumber}"></script>        
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.flot-0.8.3.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.flot.resize-0.8.3.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/run-chart.js?v=${initParam.releaseNumber}"></script>
    </body>
</html>
