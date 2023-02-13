const initialContentType = document.contentType;
const body = document.querySelector("body");
const initialBodyTextContent = body.textContent;

// https://github.com/pgrabovets/json-view
const body_template = `
<script>
    console.log("help :)");
        let data = {
            "employees":[
                {"name":"dorian"},
                {"name":"monica"},
                {"name":"jill"},
                {"name":"ashley"}
            ]
        };
        
        const tree = jsonview_create(data);
        jsonview_render(tree, document.querySelector('.root'));
        jsonview_expand(tree);
    
</script>
`;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      sendResponse({farewell: request.greeting + " received"});
      if (false) {
        if (request.greeting === "ON") {
            document.contentType = "text/html";
            document.head.setHTML(`<meta http-equiv="Content-Security-Policy" content="script-src * 'unsafe-inline';">`)
            document.body.setHTML(`<h1>début</h1><div class="root"></div><h1>fin ...</h1>`);
    
            var myscript = document.createElement('script');
            myscript.type = 'text/javascript';
            var mycode = 'alert("hello world!");';
            myscript.appendChild(document.createTextNode(mycode));
            document.body.appendChild(myscript);
          } else {
            document.contentType = initialContentType
            document.body.textContent = initialBodyTextContent;
          }
      }
    }
);

