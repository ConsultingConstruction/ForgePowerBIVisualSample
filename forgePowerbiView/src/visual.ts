
module powerbi.extensibility.visual {
    "use strict";
    
    export class PowerBI_ForgeViewer_Visual implements IVisual {
        private readonly DOCUMENT_URN: string = 'urn:dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLnFGeWV4MnpnVDl5dGJNdXQ3SGdoVnc_dmVyc2lvbj0x';
        
        // if get token from your server
        //private ACCESS_TOKEN: string = null;  
        private MY_SERVER_ENDPOINT = '<your server endpoint to get token>' //e.g. 'https://xiaodong-forge-viewer-test.herokuapp.com/api/forge/oauth/token'
        
        // if hard coded the token | Change to get token from third party tool
        private ACCESS_TOKEN: string = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU3c0dGRldUTzlBekNhSzBqZURRM2dQZXBURVdWN2VhIn0.eyJzY29wZSI6WyJkYXRhOmNyZWF0ZSIsImRhdGE6d3JpdGUiLCJkYXRhOnJlYWQiLCJidWNrZXQ6cmVhZCIsImJ1Y2tldDpjcmVhdGUiXSwiY2xpZW50X2lkIjoiWE9Xc0dBVjNCcUxVVmUwR1dtbE5Ya2JJOHgyUzlXM0EiLCJhdWQiOiJodHRwczovL2F1dG9kZXNrLmNvbS9hdWQvYWp3dGV4cDYwIiwianRpIjoiYmZpenVrMzAwUlNnbW9TeXA0OFd0MmdzMWJUZXhYamh4VWZ1V1gyRkwxdDIwMTZiMktYQXBQRHVCeHh5UG56QiIsInVzZXJpZCI6IkhRRjRSNUtXUDJNQyIsImV4cCI6MTYzNTQzMzEwMX0.auhXdnGx3SIBrNzOEvsG5vRw7_FWPHk2QSyIkpYAgLXFiftEJRY3aYQ33mQXiZF3H7XRpX-dTBUSZ8CilVn0As3Hl1KREMKUSZX5pNTGkXv9wc-6YsP_RGqMqHr5ypuoTyZdwDqV6SoiZ7Bj7TGHU229KQ4n23TOb49Cd4dHkWeuhBQ25igulDoCAFA2J9-blFlr8cT1Q14W4iyOPIyWSMWaKtp7Dg9lqH454yhsq4zUM1ZaMpX8Nh9vIYA7WFbA2O9dGvIklxrFAUsfQ6_HI4-dA0udAWgrkVV4WIYfU4nf--BPeDnYM6PZrFoeM0koAAKb0_KHLdeGu0oei-Dp8g';  

        private target: HTMLElement;
        private pbioptions:VisualConstructorOptions;
        private updateCount: number;
        private settings: VisualSettings;
        private textNode: Text;
        private forge_viewer: Autodesk.Viewing.GuiViewer3D=null;
        private selectionMgr:ISelectionManager=null;
        private selectionIdBuilder:ISelectionIdBuilder=null;


        constructor(options: VisualConstructorOptions) {
            debugger;
 
            this.pbioptions = options; 
            this.target = options.element;
            this.target.innerHTML = '<div id="forge-viewer" ></div>';

            if (typeof document !== "undefined") {

                if(this.ACCESS_TOKEN != null){
                    //hard-coded token, load the model directly
                    this.initializeViewer("forge-viewer");  
                }else{
                    this.getToken(this.MY_SERVER_ENDPOINT); 
                    //inside getToken callback, will load the model
                }
            }
        }

        private async getToken(endpoint): Promise<void> {
            
            return new Promise<void>(res => {
                $.ajax({
                    url: endpoint,

                  }).done( res=> {
                    console.log('get token done!')
                    console.log(res.access_token);

                    //when token is ready, start to initialize viewer
                    this.ACCESS_TOKEN = res.access_token;
                    this.initializeViewer("forge-viewer"); 
                  })  
            })  
        } 

        private async initializeViewer(placeHolderDOMid: string): Promise<void> {
            const viewerContainer = document.getElementById(placeHolderDOMid)
            //load Forge Viewer scripts js and style css
            await this.loadForgeViewerScriptAndStyle();

            const options = {
                env: 'AutodeskProduction',
                accessToken: this.ACCESS_TOKEN
            }

            var documentId = this.DOCUMENT_URN;
            console.log('documentId:' + documentId); 

            Autodesk.Viewing.Initializer(options, () => {
                this.forge_viewer = new Autodesk.Viewing.GuiViewer3D(viewerContainer)
                this.forge_viewer.start();
                Autodesk.Viewing.Document.load(documentId, (doc)=>{

                    //if specific viewerable, provide its guid
                    //otherwise, load the default view
                    var viewableId = undefined 
                    var viewables:Autodesk.Viewing.BubbleNode = (viewableId ? doc.getRoot().findByGuid(viewableId) : doc.getRoot().getDefaultGeometry());
                    this.forge_viewer.loadDocumentNode(doc, viewables, {}).then(i => {
                      console.log('document has been loaded') 
                      
                      this.forge_viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT,res=>{
                          //GEOMETRY_LOADED_EVENT
                          console.log('GEOMETRY_LOADED_EVENT triggered!');

                          console.log('dumpping dbIds...');

                          this.forge_viewer.getObjectTree( tree => {
                            var leaves = [];
                            tree.enumNodeChildren(tree.getRootId(),  dbId=> {
                                if (tree.getChildCount(dbId) === 0) {
                                    leaves.push(dbId);
                                }
                            }, true);
                            console.log('DbId Array: ' + leaves);

                            //possible to update PowerBI data source ??
                            //SQL database / Push Data ...
                            //see PowerBI community post:
                            //

                         });  
                      })

                      this.forge_viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT,res=>{
                        
                        //Investigation on how to update PowerBI Visual when objects are selected in Forge Viewer
                        if (res.dbIdArray.length ===1 ) { 
                            const dbId = res.dbIdArray[0];
                            console.log('Autodesk.Viewing.SELECTION_CHANGED_EVENT:'+dbId)

                            //this.selectionMgr.select()

                            
                        }
                      }) 
                    });

                }, (err)=>{
                    console.error('onDocumentLoadFailure() - errorCode:' + err); 
                });
              }); 

        }

        /*private async loadForgeViewerScripts1(): Promise<void> {
            //this will cause cross-regions error
            return new Promise<void>(res => {
                $.ajax({
                    url: 'https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.min.js',
                    dataType: "script"
                  }).done( () => {
                    console.log('ok')
                    res();
                  })
            
            })
        } */


        

        private async loadForgeViewerScriptAndStyle(): Promise<void> {

            return new Promise<void>((reslove,reject) => {

                let forgeviewerjs = document.createElement('script');
                forgeviewerjs.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.js';

                forgeviewerjs.id = 'forgeviewerjs';
                document.body.appendChild(forgeviewerjs);

                forgeviewerjs.onload = () => {
                    console.info("Viewer scripts loaded"); 
                    let link = document.createElement("link");
                    link.rel = 'stylesheet';
                    link.href = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/style.min.css';
                    link.type = 'text/css';
                    link.id = "forgeviewercss";
                    document.body.appendChild(link); 
                    console.info("Viewer CSS loaded"); 

                    reslove();
                };

                forgeviewerjs.onerror = (err) => {
                    console.info("Viewer scripts error:" +err ); 
                    reject(err);
                }; 
 
            })

        };
 
        public update(options: VisualUpdateOptions) {

            if(options.type == 4 ||options.type == 32 ) //resizing or moving
                return;
 
            debugger;

             if (!this.forge_viewer) {
                 return;
             }
             console.log('update with VisualUpdateOptions') 

             const dbIds = options.dataViews[0].table.rows.map(r => 
                <number>r[0].valueOf());
             console.log('dbIds: '  +dbIds)

             
                
             this.forge_viewer.showAll();

            //  this.forge_viewer.impl.setGhostingBrightness(true); //for isolate effect 
             this.forge_viewer.isolate(dbIds);
 
             //this.settings = ForgeViewerVisual.parseSettings(options && options.dataViews && options.dataViews[0]);

        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }
}
