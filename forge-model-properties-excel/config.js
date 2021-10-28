
module.exports = { 
   
    client_id: process.env.FORGE_CLIENT_ID||'ajJA4kN64SmADoSuQzWGhf20kyIjUukP' ,
    client_secret: process.env.FORGE_CLIENT_SECRET || 'VVSKMaspi5lYeMX4',
     
    model_urn: process.env.FORGE_MODEL_URN || 'dXJuOmFkc2sud2lwcHJvZDpmcy5maWxlOnZmLnBGcm9XODZ0U0FldTB4V3lBVlBpZGc_dmVyc2lvbj0x',
    //bucket: process.env.FORGE_BUCKET_KEY || '<your bucket of Forge>',

    scopes: ['data:read'],
    token:''
};
