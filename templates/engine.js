/* Konomi Games - Shared Engine */
const KonomiEngine={
  scene:null,camera:null,renderer:null,
  init(opts={}){
    this.scene=new THREE.Scene();
    if(opts.fog)this.scene.fog=new THREE.FogExp2(0,opts.fog);
    this.camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,1000);
    this.camera.position.z=opts.camZ||50;
    this.renderer=new THREE.WebGLRenderer({antialias:true});
    this.renderer.setSize(innerWidth,innerHeight);
    document.body.appendChild(this.renderer.domElement);
    addEventListener('resize',()=>{
      this.camera.aspect=innerWidth/innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth,innerHeight);
    });
    return this;
  },
  addLight(color=0x0f8,intensity=1,pos=[5,5,5]){
    const l=new THREE.PointLight(color,intensity,100);
    l.position.set(...pos);
    this.scene.add(l);
    return l;
  },
  addAmbient(color=0x404040){
    this.scene.add(new THREE.AmbientLight(color));
  },
  particles(count=1000,size=.5,spread=50){
    const g=new THREE.BufferGeometry();
    const p=new Float32Array(count*3);
    const c=new Float32Array(count*3);
    for(let i=0;i<count*3;i++){p[i]=(Math.random()-.5)*spread;c[i]=Math.random()}
    g.setAttribute('position',new THREE.BufferAttribute(p,3));
    g.setAttribute('color',new THREE.BufferAttribute(c,3));
    const m=new THREE.PointsMaterial({size,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending});
    const pts=new THREE.Points(g,m);
    this.scene.add(pts);
    return{mesh:pts,positions:p,colors:c,update:()=>{g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true}};
  },
  run(fn){const loop=()=>{requestAnimationFrame(loop);fn();this.renderer.render(this.scene,this.camera)};loop()}
};
