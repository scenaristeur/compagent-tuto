import { fetchDocument } from 'tripledoc';
import { solid, schema, rdf, rdfs, space } from 'rdf-namespaces';

let pod = {}
let count = 0

function PodHelper(name,age){
  this.name = name
  this.age = age
  count = count+age
  this.count = count
}

PodHelper.prototype.setWebId = function (_webId){
  console.log("UPDATE WEBID", _webId)
  if (_webId == null){
    pod = {}
  }else{
    pod.webId = _webId
    fetchDocument(pod.webId).then(
      doc => {
        //  pod.doc = doc;
        pod.person = doc.getSubject(pod.webId);
        pod.storage = pod.person.getRef(space.storage)
        pod.publicTypeIndexUrl = pod.person.getRef(solid.publicTypeIndex)
        console.log("INIT publicTypeIndexUrl",pod.publicTypeIndexUrl)
        fetchDocument(pod.publicTypeIndexUrl).then(
          publicTypeIndex => {
            pod.publicTypeIndex = publicTypeIndex;
            pod.notesListEntry = pod.publicTypeIndex.findSubject(solid.forClass, schema.TextDigitalDocument);
            pod.picsListEntry = pod.publicTypeIndex.findSubject(solid.forClass, schema.MediaObject);

            //  console.log("app.notesListEntry",app.notesListEntry)
            if (pod.notesListEntry === null){
              pod.notesListUrl = pod.initialiseNotesList(pod.person, pod.publicTypeIndex)
            }else{
              pod.notesListUrl = pod.notesListEntry.getRef(solid.instance)
              //  console.log("notesListUrl",app.notesListUrl)
            }
            fetchDocument(pod.notesListUrl).then(
              notesList => {
                pod.notesList = notesList;
                console.log("pod.notesList",pod.notesList)
                pod.notesUri = notesList.findSubjects(rdf.type, schema.TextDigitalDocument)
                console.log("notesUri",pod.notesUri)
              })

              console.log("pod.picsListEntry",pod.picsListEntry)
              if (pod.picsListEntry === null){
                pod.picsListUrl = app.initialisePicsList(pod.person, pod.publicTypeIndex)
              }else{
                pod.picsListUrl = pod.picsListEntry.getRef(solid.instance)
                console.log("picsListUrl",pod.picsListUrl)
              }
              fetchDocument(pod.picsListUrl).then(
                picsList => {
                  pod.picsList = picsList;
                  console.log("pod.picsList",pod.picsList)
                  pod.picsUri = picsList.findSubjects(rdf.type, schema.TextDigitalDocument)
                  console.log("picsUri",pod.picsUri)
                })


              },
              err => {console.log(err)}
            );
          },
          err => {
            console.log(err)
          }
        );
      }
    }

    PodHelper.prototype.getWebId= function(){
      return pod.webId
    }

    PodHelper.prototype.getPod= function(key){
      return pod[key]
    }





    export {PodHelper}
