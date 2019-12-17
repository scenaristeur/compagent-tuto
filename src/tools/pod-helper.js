import { fetchDocument } from 'tripledoc';
import { solid, schema, rdf, rdfs } from 'rdf-namespaces';



let webId = null
let person = null
let storage = null
let publicTypeIndex = null
let publicTypeIndexUrl = null
let count = 0




function PodHelper(name,age){
  this.name = name
  this.age = age
  count = count+age
  this.count = count
}


PodHelper.prototype.setWebId = function (_webId){
  console.log("UPDATE WEBID", _webId)
  webId = _webId
}

PodHelper.prototype.getWebId= function(){
  console.log("UPDATE WEBID", webId)
  return webId
}

export {PodHelper}
