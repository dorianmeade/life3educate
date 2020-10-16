/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  
const fetch = require("node-fetch");
const DiscoveryV1 = require("watson-developer-cloud/discovery/v1");

async function main(params) {
    if (params.type === "esco") 
    {
        var myURL = "https://ec.europa.eu/esco/api/resource/occupation?language=en&uri=";
        if (params.job == "developer")
        {
            var uri = "http://data.europa.eu/esco/occupation/c40a2919-48a9-40ea-b506-1f34f693496d";
        }
        else if (params.job == "UI designer")
        {
            var uri = "http://data.europa.eu/esco/occupation/96e20037-0a25-4bf6-a25e-808d1605d890";
        }
        else if (params.job == "UX designer")
        {
            var uri = "http://data.europa.eu/esco/occupation/faed411a-f920-4100-86a8-b877928b429c";
        }
        else //search for career 
        {
            myURL = "https://ec.europa.eu/esco/api/search?language=en&text="
            myURL = myURL + params.job;
            
            return { result: 'We do not have that career information yet.' };
        }
            
            let response = await fetch(myURL + uri, {headers: {'Accept': 'application/json'} });
            let data = await response.json();
            return {result: data.description.en.literal};
    }
    else //if not esco, then discovery
    {
        const discovery = new DiscoveryV1({
          version: "2019-03-25",
          iam_apikey: params.api_key,
          url: params.url,
        });
        
        const queryParams = {
          environment_id: params.env_id,
          collection_id: params.collection_id,
          natural_language_query: params.job,
          passages: true,
          passage_count: 3,
        };
        try {
          data = await discovery.query(queryParams);
          
          var ids = [];
          
        // for(var i = 0; i < data.passages.length; i++) {
        //    var obj = data.passages.document_id[i];
        //    ids.push(obj)
        //}
        
         let response = data.passages.map((v, i) => {
            return `${v.document_id}
                     ${v.passage_text}`;
                    // ${v.url}`;
             });
          return {
            result: 
              `Here are some ${params.job}'s we can provide to you. \n\n` +
                response.join("\n\n"),
          };
        } catch (err) {
          return  { error: "it failed : " + err };
        }
    //return { result: 'Hello discovery test' };

    }
}

