var nodes = [];
function random(a,b) {
  return Math.random()*(b-a)+a;
}
function spawnNode() {
  nodes.push([random(3,c.width-3),random(13,c.height-13),random(-1,1),random(-1,1)]);
}
function gdis(a,b) {
  return Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2));
}
function lerp(a,b,c) {
  return a-(a-b)*c;
}
var nodecolor = [105,105,105];
var linecolor = [105,105,105];
var mdown = false;
var pushdistance;
var attractiondistance;
var unattractiondistance;
var connectiondistance;
var nodesize;
var start;
var mouse = [-5000,-5000];
var last;
var fps = 120;
var w;
var h;
var steps = 250;
var stepamount = 250;
var qualityrange = 60;
function clamp(a,b,c) {
	return Math.max(Math.min(a,c),b);
}
var squality;
var blurring = 1;
function frame() {
  c=document.getElementsByClassName("maincanvas")[0];
  if(document.getElementsByClassName("pages")[0].offsetTop+c.offsetTop<=0) {
	  last = undefined;
	  return requestAnimationFrame(frame);
  }
  c.width=innerWidth;
  c.height = innerHeight/2;
  ctx=c.getContext("2d");
  ctx.imageSmoothingQuality="low";
  if(w!==c.width||h!==c.height) {
    nodes = [];
    start = true;
    w=c.width;
    h=c.height;
  }
  //-=-//
  connectiondistance = innerHeight/7;
  nodesize = innerHeight/400;
  attractiondistance = innerHeight/20;
  unattractiondistance = innerHeight/40;
  pushdistance = innerHeight/10;
  speed = innerHeight/3e3;
  //-=-//
  var now = Date.now();
  if(!last) last = now;
  var delta = now-last;
  var average = delta/(1000/fps);
  steps+=delta;
  var quality = squality/blurring;
  if(steps>=stepamount) {
	squality = clamp(1/Math.pow(1/((1000/qualityrange)/average),2),0,1);
	steps=0;
  }
  //-=-//
  if(start) {
    var beginnodes = innerWidth/innerHeight*36;
    start = false;
    for(var i=0;i<beginnodes;i++) {
      spawnNode();
    }
  }
  ctx.fillStyle="rgb("+nodecolor+")";
  for(var i=0;i<nodes.length;i++) {
    var node = nodes[i];
    ctx.beginPath();
    ctx.arc(node[0]*quality,node[1]*quality,nodesize*quality,0,2*Math.PI);
    ctx.fill();
    ctx.closePath();
    if(node[0]<nodesize||node[0]>c.width-nodesize)
      node[2]=-node[2];
    if(node[1]<nodesize||node[1]>c.height-nodesize)
      node[3]=-node[3];
    var clipped = false;
    if(gdis(node,mouse)<pushdistance) {
      clipped = true;
      if(mdown) {
        var ang = Math.atan2(node[1]-mouse[1],node[0]-mouse[0]);
		var res = [node[0]+Math.cos(ang)*speed*4*average,node[1]+Math.sin(ang)*speed*4*average];
        if(res[0]>nodesize&&res[0]<c.width-nodesize)
        node[0]=res[0];
        if(res[1]>nodesize&&res[1]<c.height-nodesize)
        node[1]=res[1];
      }
    }
    for(j=i;j<nodes.length;j++) {
	  var point = nodes[j];
      if(gdis(point,node)<attractiondistance&&gdis(point,node)>unattractiondistance) {
        var ang = Math.atan2(point[1]-node[1],point[0]-node[0]);
		var res = [node[0]+Math.cos(ang)*speed*.1*average,node[1]+Math.sin(ang)*speed*.1*average];
        if(res[0]>nodesize&&res[0]<c.width-nodesize)
			node[0]=res[0];
        if(res[1]>nodesize&&res[1]<c.height-nodesize)
			node[1]=res[1];
      }
      if(gdis(point,node)<connectiondistance) {
        ctx.beginPath();
        var opac = (1-gdis(point,node)/connectiondistance)*2;
        if(clipped) opac = 1;
		ctx.lineWidth = 1*quality;
        ctx.strokeStyle="rgba("+linecolor+","+opac+")";
        ctx.moveTo(node[0]*quality,node[1]*quality);
        ctx.lineTo(point[0]*quality,point[1]*quality);
        ctx.stroke();
        ctx.closePath();
      }
    }
    node[0]+=node[2]*speed*average;
    node[1]+=node[3]*speed*average;
  }
  var js = JSON.parse(JSON.stringify(document.getElementsByClassName("maincanvas")[0].toDataURL()));
  var offcanvas = document.getElementsByClassName("offcanvas")[0];
  offcanvas.width=c.width;
  offcanvas.height=c.height;
  var offctx = offcanvas.getContext("2d");
  offctx.drawImage(document.getElementsByClassName("maincanvas")[0],0,0);
  ctx.fillStyle="#ddd";
  ctx.fillRect(0,0,c.width,c.height);
  ctx.drawImage(offcanvas,0,0,c.width*quality,c.height*quality,0,0,c.width,c.height);
  last=now;
  requestAnimationFrame(frame);
}
document.addEventListener("mousemove",e=>{
  mouse=[e.clientX,e.clientY-innerHeight/4];
});
document.addEventListener("mousedown",()=>{
  mdown = true;
});
document.addEventListener("mouseup",()=>{
  mdown = false;
});
var bulbamount = 0;
function addPage(a="") {
  document.getElementsByClassName("bulbs")[0].innerHTML+="<div class=\"bulb\" onclick=\"switchPage("+(++bulbamount)+")\"></div>";
  document.getElementsByClassName("pages")[0].innerHTML+=`
  <div style="top:`+(document.getElementsByClassName("page").length*100+100)+`vh;text-align:center;" class="page">
    `+a+`
  </div>`;
}
var cPage = 0;
function switchPage(a) {
  cPage = a;
  for(var i=0;i<document.getElementsByClassName("selected").length;i++) {
    document.getElementsByClassName("selected")[i].classList.remove("selected");
  }
  document.getElementsByClassName("bulb")[a].classList.add("selected");
  document.getElementsByClassName("pages")[0].style.top = -(innerHeight*a)+"px";
}
function addCss(a) {
	document.body.innerHTML+="<style>"+a+"</style>";
}
function scrollAttempt(e) {
  var e = event||e;
  var delta = Math.max(-1,Math.min(1,(e.wheelDelta||-e.detail)));
  if(delta===-1&&cPage<document.getElementsByClassName("page").length) switchPage(cPage+1);
  if(delta===1&&cPage>0) switchPage(cPage-1);
}
function fixedCheck() {
	if(document.getElementsByClassName("pages")[0].offsetTop<=-innerHeight/1.5) {
		document.getElementsByClassName("credits1")[0].style.top="88vh";
	} else {
		document.getElementsByClassName("credits1")[0].style.top="112vh";
	}
}
setInterval(fixedCheck);
setTimeout(()=>{
	switchPage(0);
	frame();
	addPage(`
		<div class="title1">1. What's the title of the book?</div>
		<div class="paragraph">The title of the book is "The lady in white".</div>
	`);
	addCss(`
	
		.title1:hover, .paragraph:hover {
			color: black;
		}
		.title1 {
			font-family: "aqua";
			font-size: 5.5vh;
			margin-top: 5.75vh;
			color: #999;
			text-align: center;
			transition-timing-function: ease-in-out;
			transition: 1s color;
		}
		.paragraph {
			color: #555;
			font-family: "aqua";
			font-size: 3vh;
			text-align: center;
			transition-timing-function: ease-in-out;
			transition: color 1s;
		}
	`);
	addPage(`
		<div class="title1">2. Explain the title.</div>
		<div class="paragraph">John's wife was dressed in white when they met alongside the road.</div>
	`);
	addPage(`
		<div class="title1">3. Who is the writer/author?</div>
		<div class="paragraph">The author of the book is called Colin Campbell, he has worked in English Language Teaching (ELT) for 28 years as a teacher, a trainer, and Director of Studies and Consultant.
During that period of time he has worked in several countries, including Spain, Italy, Poland, Ireland and Estonia.
He has worked at the University of reading since 1998 where he teaches English for Academic purposes.
The book has not been made into a film and he has not won any awards.</div>
	`);
	addPage(`
		<div class="title1">4. Describe the cover of the book as accurate as possible.</div>
		<img class="imagespecial" src="./omslag.png">
		<div class="paragraphspecial">The cover of the book is a picture of a woman dressed in white standing in the middle of a forest next to a lake.</div>
		<div class="hovermessage" onmouseenter="document.getElementsByClassName('paragraphspecial')[0].style.opacity=0;this.style.opacity=0;" onmouseleave="document.getElementsByClassName('paragraphspecial')[0].style.opacity=1;this.style.opacity=1;">-Hover to show image-</div>
	`);
	addCss(`
		.paragraphspecial {
			width: 50vw;
			margin-left: 25vw;
			color: #555;
			font-family: "aqua";
			font-size: 3vh;
			text-align: center;
			transition-timing-function: ease-in-out;
			transition: opacity .3s;
			height: calc(50vh + 8px);
			background: white;
			margin-top: calc(-50vh - 8px);
			position: absolute;
			opacity: 1;
		}
		.imagespecial {
			width: 32vh;
			height: 50vh;
			border-radius: 3.2vh
		}
		.hovermessage {
			margin-top: -26.5vh;
			position: absolute;
			width: 50vw;
			margin-left: 25vw;
			color: #555;
			font-family: "";
			font-size: 3vh;
			text-align: center;
			transition-timing-function: ease-in-out;
			transition: opacity .3s;
		}
	`);
	addPage(`
		<div class="title1">5. Name the name of the possible draftsman, illustrator or photographer.</div>
		<div class="paragraph">The book doesn't contain any pictures.</div>
	`);
	addPage(`
		<div class="title1">6. What is the theme? Explain why it is. Name an example from the story. (e.g realistic youthnovel, because it could have really happened + an example from the story)</div>
		<div class="paragraph">The theme is "Realistisch Spookverhaal" which roughly translates to realistic ghoststory, the reason it is this theme is because ghosts do tend to show up in the story.
A persuading example from the story is when John has a nightmare and a man shows up and tells him that "Little babies always come back".</div>
	`);
	addPage(`
		<div class="title1">7. Who are the primary character(s) in the story?</div>
		<div class="paragraph">The primary characters in the story are Jenny, Rachel and John.</div>
	`);
	addPage(`
		<div class="title1">8. What is the story situation / the perspective</div>
		<div class="paragraph">The story is told from the all-knowing perspective / auctorial perspective.</div>
	`);
	addPage(`
		<div class="title1">9. Briefly describe the appearance of the primary character(s). (Give at least three characteristics)</div>
		<div class="paragraph">Jenny has brown hair, I cannot describe any more of the characters because there aren't any pictures in the book and their appearance isn't described in the book itself.</div>
	`);
	addPage(`
		<div class="title1">10. Briefly describe the character of the primary character(s). Give at least three characteristics and substantiate them (You can name examples from the book)</div>
		<div class="paragraph">John is quite nice, quickly angered and caring.<br>
Rachel is enthusiastic, honest and caring.<br>
Jenny is a real talker, also quite nice and concerning of others.</div>
	`);
	addPage(`
		<div class="title1">11. Which secondary characters also play an important role into the story?</div>
		<div class="paragraph">A few people who gave rides to a lady in a white dress.<br>
The policeman who helped them by informing them more of the story.<br>
A man who showed up in John's nightmare</div>
	`);
	addPage(`
		<div class="title1">12. What is the relationship between the primary character and the secondary character(s) (Also appoint whether this character is an assistant or an opponent of the primary character)</div>
		<div class="paragraph">John doesn't have any relations with the people who gave rides.<br>
He doesn't have any relations with the policeman who informed him.<br>
He also doesn't have any relations with the man who showed up in his nightmare.</div>
	`);
	addPage(`
		<div class="title1">13. In which place(s) or in which countr(y)(ies) does the story take place?</div>
		<div class="paragraph">The story takes place in multiple places, it took place in John's office, at his house, in his car, at a small village in Brighton, England and a tiny island in Scotland.</div>
	`);
	addPage(`
		<div class="title1">14. In what time does the story take place? How much time goes by in the story? Is the story being told chronological or non-chronological?</div>
		<div class="paragraph">Nowhere in the book does it state when the story takes place.
I cannot tell how much time goes by in the story, if I had to guess I would guess about four weeks.
The story is being told chronologically and does contain some mentions to the past.</div>
	`);
	addPage(`
		<div class="title1">15. Write down the occurence(s) or the problem(s) where the primary character(s) are confronted with.</div>
		<div class="paragraph">John is being confronted with the problem of his wife possibly being a ghost as the story of them meeting is the same as the story of some people giving rides to others, he also has the occurance of a man appearing in a nightmare of his.<br>
Rachel however was being confronted of Patrick being injured or hurt by a car.</div>
	`);
	addPage(`
		<div class="title1">16. What is the situation in the end? Explain to what extent the problem has been solved.</div>
		<div class="paragraph">Rachel isn't afraid of cars anymore, John still has the struggle of both the problems he already had.</div>
	`);
	addPage(`
		<div class="title1">17. Does the story have an open or a closed ending? Elaborate your answer.</div>
		<div class="paragraph">The story has an open ending, at the end of the story John drove to the little village in Brighton. When he arrived he saw a lady in a white dress, after that he just drives off and receives a phone call from Rachel asking if he was alright.</div>
	`);
	addPage(`
		<div class="title1">18. Write a brief summary of the story. 1/3</div>
		<div class="paragraph">The story starts with two producers for the television, John and Jenny.
John has a one year old child called Patrick, this is relevant later on in the story.
They wanted to make a new programme for TV based around urban myths, one of the stories which sticked out was about a hitch-hiker, a man was driving across the little village and came across a lady dressed fully in white, she said her car had broken down, the man didn't see a car in the region...
The man still decided to pick up m'lady in white, she suddenly started screaming when they were driving, she reached for the wheel and sharply turned the wheel to the other side.
The driver tried to stop her, causing the car to go haywire, the driver manages to stop the car next to the road.
The lady in white ran away from the vehicle and the driver turns to her, and she's... Gone!?
Jenny stopped the tape of the story and John told Jenny that that was the exact way he had met Rachel, at the exact same location and also dressed in white.
John left the office and got in his car, not knowing where she'd go, Jenny also hopped in, they had driven and driven until they had arrived at the little village.
Jenny called the police without any apparent reason, the police suggested that they talked to the local police, it took them a while to find the station because it looked like an ordinary house.
He told them that the a woman with her young son of one year old were killed in a Single Car Accident(SCA).
They thanked the police officer for the information he had provided them and they went on their way back.
John had decided that he would forget the story on a holiday to an island in Ireland.</div>
	`);
	addPage(`
		<div class="title1">18. Write a brief summary of the story. 2/3</div>
		<div class="paragraph">John had found a little place on his last vacation there and went there, he took a nap when he suddenly got a nightmare about waking up in a room, without Rachel next to him.
A man appeared and took Patrick from him and told him "The boy is fine, it's all right. He'll be OK now. They don't really die, you know, they come back. The little ones who go before their time. They come back from the other side. They always come back to us. They always come back".
John woke up with Rachel bending over him, touching his face.
He told her that he had a nightmare and went back.
When he was back in England, from his holiday, he left for work, but when he sat down in his office he couldn't think about work, the story was still in his head.
He left the office and sat in his car, he drove to Brighton but before he arrived somewhere, he decided that it was getting late and that he should head back home.
He stayed up late with the excuse of wanting to see a programme on the telly, when he went to bed later that evening he couldn't sleep, he was afraid of going to sleep because of what had happened.
The next morning he told Rachel that he would be working late this evening and that he had done almost no work the day before.
John got into his car and drove off, he didn't go to work in the slightest, he went straight to the village in Brighton, where he had met Rachel.
He sat there in his car for hours, on the first night he had seen nothing, but the second night he saw something appearing in the rear view mirror of his car.
He heard footsteps... But then he saw a dog on a leash with a man walking next to it, the man walked by and a few minutes later he returned on the other side of the road, the man came up to his window, John started the car and drove off because he didn't feel like explaining what he was doing in his car alone at night.
On the third night it was a wet night, he was driving when all of a sudden he saw something white in his rear view mirror...</div>
	`);
	addPage(`
	<div class="title1">18. Write a brief summary of the story. 3/3</div>
	<div class="paragraph">
At first, John thought that it was a light, he looked again, but the white was still there.
The white of a dress. A woman in white. A woman in white was standing just behind the car, just standing still, right there.
He could only see a part of her body. He could not see her legs, face or head because of where she was standing. He didn't want to turn around and look at her. He was afraid.
He looked into the side mirror and could see it was a woman, definitely a woman. He could still not see the head, nor the face.
The woman took a step, she was walking, definitely walking... She moved up to the window but John could only see her dress, she backed up and John could see her neck.
John drove away, almost a kilometre, without turning on the car lights.
He calls Rachel, he has to know where she is... The call wasn't answered.
Was she the lady? Where is she at right now? He called Rachel again, this time she had answered the phone, she said she was already asleep.</div>
	`);
	addPage(`
		<div class="title1">19. Write your opinion about the book below. Add what was good about it, worse or bad. (Use atleast three words about how you felt about it, support your opininon with arguments)</div>
		<div class="paragraph">I thought it was a pretty good book, it wasn't all bad.<br>
I liked the theme, it wasn't too spooky,<br>
it has a pretty nice storyline to it so you can follow it all,<br>
and I liked the mysteries surrounding it all, the lady in white, the man, the stories, etc.</div>
	`);
	addPage(`
		<div class="title1">This is the end of my bookreview<br>But i still have a quiz for you! (Only if there's time left)</div>
		<div class="paragraph">
			A=Sit under table<br>
			B=Stay seated<br>
			C=Stand up<br>
			<br>
			What is the name of the primary character?<br>
			A) Jonas<br>
			B) John<br>
			C) Johnny
		</div>
		
	`);
	addPage(`
		<div class="title1">Quiz</div>
		<div class="paragraph">
			A=Sit under table<br>
			B=Stay seated<br>
			C=Stand up<br>
			<br>
			What is John's wife called?<br>
			A) Jenny<br>
			B) Rachel<br>
			C) Patricia
		</div>
	`);
	addPage(`
		<div class="title1">Quiz</div>
		<div class="paragraph">
			A=Sit under table<br>
			B=Stay seated<br>
			C=Stand up<br>
			<br>
			What is John's son called?<br>
			A) Patrick<br>
			B) Johnny<br>
			C) Brad
		</div>
	`);
	addPage(`
		<div class="title1">Quiz</div>
		<div class="paragraph">
			A=Sit under table<br>
			B=Stay seated<br>
			C=Stand up<br>
			<br>
			How old is Patrick?<br>
			A) 6 months old<br>
			B) One year old<br>
			C) Two years old
		</div>
	`);
	addPage(`
		<div class="title1">Quiz</div>
		<div class="paragraph">
			A=Sit under table<br>
			B=Stay seated<br>
			C=Stand up<br>
			<br>
			What job does John have?<br>
			A) TV-Producer<br>
			B) Radio-Producer<br>
			C) Journalist
		</div>
	`);
});
document.addEventListener("mousewheel",scrollAttempt);
document.addEventListener("keydown",e=>{
	if(e.key==="ArrowUp"&&cPage>0) switchPage(cPage-1); 
	if(e.key==="ArrowDown"&&cPage<document.getElementsByClassName("page").length) switchPage(cPage+1);
});
