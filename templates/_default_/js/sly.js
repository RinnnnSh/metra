;(function($,w,undefined){'use strict';var pluginName='sly';var className='Sly';var namespace=pluginName;var cAF=w.cancelAnimationFrame||w.cancelRequestAnimationFrame;var rAF=w.requestAnimationFrame;var transform,gpuAcceleration;var $doc=$(document);var dragInitEvents='touchstart.'+namespace+' mousedown.'+namespace;var dragMouseEvents='mousemove.'+namespace+' mouseup.'+namespace;var dragTouchEvents='touchmove.'+namespace+' touchend.'+namespace;var clickEvent='click.'+namespace;var mouseDownEvent='mousedown.'+namespace;var interactiveElements=['INPUT','SELECT','BUTTON','TEXTAREA'];var tmpArray=[];var time;function Sly(frame,options,callbackMap){var o=$.extend({},Sly.defaults,options);var self=this;var parallax=isNumber(frame);var $frame=$(frame);var $slidee=$frame.children().eq(0);var frameSize=0;var slideeSize=0;var pos={start:0,center:0,end:0,cur:0,dest:0};var $sb=$(o.scrollBar).eq(0);var $handle=$sb.children().eq(0);var sbSize=0;var handleSize=0;var hPos={start:0,end:0,cur:0};var $pb=$(o.pagesBar);var $pages=0;var pages=[];var $items=0;var items=[];var rel={firstItem:0,lastItem:0,centerItem:0,activeItem:-1,activePage:0};var basicNav=o.itemNav==='basic';var forceCenteredNav=o.itemNav==='forceCentered';var centeredNav=o.itemNav==='centered'||forceCenteredNav;var itemNav=!parallax&&(basicNav||centeredNav||forceCenteredNav);var $scrollSource=o.scrollSource?$(o.scrollSource):$frame;var $dragSource=o.dragSource?$(o.dragSource):$frame;var $forwardButton=$(o.forward);var $backwardButton=$(o.backward);var $prevButton=$(o.prev);var $nextButton=$(o.next);var $prevPageButton=$(o.prevPage);var $nextPageButton=$(o.nextPage);var callbacks={};var last={};var animation={};var move={};var dragging={released:1};var scrolling={last:0,delta:0,resetTime:200};var renderID=0;var historyID=0;var cycleID=0;var continuousID=0;var i,l;if(!parallax){frame=$frame[0];}self.initialized=0;self.frame=frame;self.slidee=$slidee[0];self.pos=pos;self.rel=rel;self.items=items;self.pages=pages;self.isPaused=0;self.options=o;self.dragging=dragging;function load(){var lastItemsCount=0;var lastPagesCount=pages.length;pos.old=$.extend({},pos);frameSize=parallax?0:$frame[o.horizontal?'width':'height']();sbSize=$sb[o.horizontal?'width':'height']();slideeSize=parallax?frame:$slidee[o.horizontal?'outerWidth':'outerHeight']();pages.length=0;pos.start=0;pos.end=Math.max(slideeSize-frameSize,0);if(itemNav){lastItemsCount=items.length;$items=$slidee.children(o.itemSelector);items.length=0;var paddingStart=getPx($slidee,o.horizontal?'paddingLeft':'paddingTop');var paddingEnd=getPx($slidee,o.horizontal?'paddingRight':'paddingBottom');var borderBox=$($items).css('boxSizing')==='border-box';var areFloated=$items.css('float')!=='none';var ignoredMargin=0;var lastItemIndex=$items.length-1;var lastItem;slideeSize=0;$items.each(function(i,element){var $item=$(element);var itemSize=$item[o.horizontal?'outerWidth':'outerHeight']();var itemMarginStart=getPx($item,o.horizontal?'marginLeft':'marginTop');var itemMarginEnd=getPx($item,o.horizontal?'marginRight':'marginBottom');var itemSizeFull=itemSize+itemMarginStart+itemMarginEnd;var singleSpaced=!itemMarginStart||!itemMarginEnd;var item={};item.el=element;item.size=singleSpaced?itemSize:itemSizeFull;item.half=item.size/2;item.start=slideeSize+(singleSpaced?itemMarginStart:0);item.center=item.start-Math.round(frameSize/2-item.size/2);item.end=item.start-frameSize+item.size;if(!i){slideeSize+=paddingStart;}slideeSize+=itemSizeFull;if(!o.horizontal&&!areFloated){if(itemMarginEnd&&itemMarginStart&&i>0){slideeSize-=Math.min(itemMarginStart,itemMarginEnd);}}if(i===lastItemIndex){item.end+=paddingEnd;slideeSize+=paddingEnd;ignoredMargin=singleSpaced?itemMarginEnd:0;}items.push(item);lastItem=item;});$slidee[0].style[o.horizontal?'width':'height']=(borderBox?slideeSize:slideeSize-paddingStart-paddingEnd)+'px';slideeSize-=ignoredMargin;if(items.length){pos.start=items[0][forceCenteredNav?'center':'start'];pos.end=forceCenteredNav?lastItem.center:frameSize<slideeSize?lastItem.end:pos.start;}else{pos.start=pos.end=0;}}pos.center=Math.round(pos.end/2+pos.start/2);updateRelatives();if($handle.length&&sbSize>0){if(o.dynamicHandle){handleSize=pos.start===pos.end?sbSize:Math.round(sbSize*frameSize/slideeSize);handleSize=within(handleSize,o.minHandleSize,sbSize);$handle[0].style[o.horizontal?'width':'height']=handleSize+'px';}else{handleSize=$handle[o.horizontal?'outerWidth':'outerHeight']();}hPos.end=sbSize-handleSize;if(!renderID){syncScrollbar();}}if(!parallax&&frameSize>0){var tempPagePos=pos.start;var pagesHtml='';if(itemNav){$.each(items,function(i,item){if(forceCenteredNav){pages.push(item.center);}else if(item.start+item.size>tempPagePos&&tempPagePos<=pos.end){tempPagePos=item.start;pages.push(tempPagePos);tempPagePos+=frameSize;if(tempPagePos>pos.end&&tempPagePos<pos.end+frameSize){pages.push(pos.end);}}});}else{while(tempPagePos-frameSize<pos.end){pages.push(tempPagePos);tempPagePos+=frameSize;}}if($pb[0]&&lastPagesCount!==pages.length){for(var i=0;i<pages.length;i++){pagesHtml+=o.pageBuilder.call(self,i);}$pages=$pb.html(pagesHtml).children();$pages.eq(rel.activePage).addClass(o.activeClass);}}rel.slideeSize=slideeSize;rel.frameSize=frameSize;rel.sbSize=sbSize;rel.handleSize=handleSize;if(itemNav){if(!self.initialized){activate(o.startAt);self[centeredNav?'toCenter':'toStart'](o.startAt);}else if(rel.activeItem>=items.length||lastItemsCount===0&&items.length>0){activate(rel.activeItem>=items.length?items.length-1:0,!lastItemsCount);}slideTo(centeredNav&&items.length?items[rel.activeItem].center:within(pos.dest,pos.start,pos.end));}else{if(!self.initialized){slideTo(o.startAt,1);}else{slideTo(within(pos.dest,pos.start,pos.end));}}trigger('load');}self.reload=load;function slideTo(newPos,immediate,dontAlign){if(itemNav&&dragging.released&&!dontAlign){var tempRel=getRelatives(newPos);var isNotBordering=newPos>pos.start&&newPos<pos.end;if(centeredNav){if(isNotBordering){newPos=items[tempRel.centerItem].center;}if(forceCenteredNav&&o.activateMiddle){activate(tempRel.centerItem);}}else if(isNotBordering){newPos=items[tempRel.firstItem].start;}}if(dragging.init&&dragging.slidee&&o.elasticBounds){if(newPos>pos.end){newPos=pos.end+(newPos-pos.end)/6;}else if(newPos<pos.start){newPos=pos.start+(newPos-pos.start)/6;}}else{newPos=within(newPos,pos.start,pos.end);}animation.start=+new Date();animation.time=0;animation.from=pos.cur;animation.to=newPos;animation.delta=newPos-pos.cur;animation.tweesing=dragging.tweese||dragging.init&&!dragging.slidee;animation.immediate=!animation.tweesing&&(immediate||dragging.init&&dragging.slidee||!o.speed);dragging.tweese=0;if(newPos!==pos.dest){pos.dest=newPos;trigger('change');if(!renderID){render();}}resetCycle();updateRelatives();updateButtonsState();syncPagesbar();}function render(){if(!renderID){renderID=rAF(render);if(dragging.released){trigger('moveStart');}return;}if(animation.immediate){pos.cur=animation.to;}else if(animation.tweesing){animation.tweeseDelta=animation.to-pos.cur;if(Math.abs(animation.tweeseDelta)<0.1){pos.cur=animation.to;}else{pos.cur+=animation.tweeseDelta*(dragging.released?o.swingSpeed:o.syncSpeed);}}else{animation.time=Math.min(+new Date()-animation.start,o.speed);pos.cur=animation.from+animation.delta*jQuery.easing[o.easing](animation.time/o.speed,animation.time,0,1,o.speed);}if(animation.to===pos.cur){pos.cur=animation.to;dragging.tweese=renderID=0;}else{renderID=rAF(render);}trigger('move');if(!parallax){if(transform){$slidee[0].style[transform]=gpuAcceleration+(o.horizontal?'translateX':'translateY')+'('+(-pos.cur)+'px)';}else{$slidee[0].style[o.horizontal?'left':'top']=-Math.round(pos.cur)+'px';}}if(!renderID&&dragging.released){trigger('moveEnd');}syncScrollbar();}function syncScrollbar(){if($handle.length){hPos.cur=pos.start===pos.end?0:(((dragging.init&&!dragging.slidee)?pos.dest:pos.cur)-pos.start)/(pos.end-pos.start)*hPos.end;hPos.cur=within(Math.round(hPos.cur),hPos.start,hPos.end);if(last.hPos!==hPos.cur){last.hPos=hPos.cur;if(transform){$handle[0].style[transform]=gpuAcceleration+(o.horizontal?'translateX':'translateY')+'('+hPos.cur+'px)';}else{$handle[0].style[o.horizontal?'left':'top']=hPos.cur+'px';}}}}function syncPagesbar(){if($pages[0]&&last.page!==rel.activePage){last.page=rel.activePage;$pages.removeClass(o.activeClass).eq(rel.activePage).addClass(o.activeClass);trigger('activePage',last.page);}}self.getPos=function(item){if(itemNav){var index=getIndex(item);return index!==-1?items[index]:false;}else{var $item=$slidee.find(item).eq(0);if($item[0]){var offset=o.horizontal?$item.offset().left-$slidee.offset().left:$item.offset().top-$slidee.offset().top;var size=$item[o.horizontal?'outerWidth':'outerHeight']();return{start:offset,center:offset-frameSize/2+size/2,end:offset-frameSize+size,size:size};}else{return false;}}};self.moveBy=function(speed){move.speed=speed;if(dragging.init||!move.speed||pos.cur===(move.speed>0?pos.end:pos.start)){return;}move.lastTime=+new Date();move.startPos=pos.cur;continuousInit('button');dragging.init=1;trigger('moveStart');cAF(continuousID);moveLoop();};function moveLoop(){if(!move.speed||pos.cur===(move.speed>0?pos.end:pos.start)){self.stop();}continuousID=dragging.init?rAF(moveLoop):0;move.now=+new Date();move.pos=pos.cur+(move.now-move.lastTime)/1000*move.speed;slideTo(dragging.init?move.pos:Math.round(move.pos));if(!dragging.init&&pos.cur===pos.dest){trigger('moveEnd');}move.lastTime=move.now;}self.stop=function(){if(dragging.source==='button'){dragging.init=0;dragging.released=1;}};self.prev=function(){self.activate(rel.activeItem-1);};self.next=function(){self.activate(rel.activeItem+1);};self.prevPage=function(){self.activatePage(rel.activePage-1);};self.nextPage=function(){self.activatePage(rel.activePage+1);};self.slideBy=function(delta,immediate){if(!delta){return;}if(itemNav){self[centeredNav?'toCenter':'toStart'](within((centeredNav?rel.centerItem:rel.firstItem)+o.scrollBy*delta,0,items.length));}else{slideTo(pos.dest+delta,immediate);}};self.slideTo=function(pos,immediate){slideTo(pos,immediate);};function to(location,item,immediate){if(type(item)==='boolean'){immediate=item;item=undefined;}if(item===undefined){slideTo(pos[location],immediate);}else{if(centeredNav&&location!=='center'){return;}var itemPos=self.getPos(item);if(itemPos){slideTo(itemPos[location],immediate,!centeredNav);}}}self.toStart=function(item,immediate){to('start',item,immediate);};self.toEnd=function(item,immediate){to('end',item,immediate);};self.toCenter=function(item,immediate){to('center',item,immediate);};function getIndex(item){return item!=null?isNumber(item)?item>=0&&item<items.length?item:-1:$items.index(item):-1;}self.getIndex=getIndex;function getRelativeIndex(item){return getIndex(isNumber(item)&&item<0?item+items.length:item);}function activate(item,force){var index=getIndex(item);if(!itemNav||index<0){return false;}if(last.active!==index||force){$items.eq(rel.activeItem).removeClass(o.activeClass);$items.eq(index).addClass(o.activeClass);last.active=rel.activeItem=index;updateButtonsState();trigger('active',index);}return index;}self.activate=function(item,immediate){var index=activate(item);if(o.smart&&index!==false){if(centeredNav){self.toCenter(index,immediate);}else if(index>=rel.lastItem){self.toStart(index,immediate);}else if(index<=rel.firstItem){self.toEnd(index,immediate);}else{resetCycle();}}};self.activatePage=function(index,immediate){if(isNumber(index)){slideTo(pages[within(index,0,pages.length-1)],immediate);}};function getRelatives(slideePos){slideePos=within(isNumber(slideePos)?slideePos:pos.dest,pos.start,pos.end);var relatives={};var centerOffset=forceCenteredNav?0:frameSize/2;if(!parallax){for(var p=0,pl=pages.length;p<pl;p++){if(slideePos>=pos.end||p===pages.length-1){relatives.activePage=pages.length-1;break;}if(slideePos<=pages[p]+centerOffset){relatives.activePage=p;break;}}}if(itemNav){var first=false;var last=false;var center=false;for(var i=0,il=items.length;i<il;i++){if(first===false&&slideePos<=items[i].start+items[i].half){first=i;}if(center===false&&slideePos<=items[i].center+items[i].half){center=i;}if(i===il-1||slideePos<=items[i].end+items[i].half){last=i;break;}}relatives.firstItem=isNumber(first)?first:0;relatives.centerItem=isNumber(center)?center:relatives.firstItem;relatives.lastItem=isNumber(last)?last:relatives.centerItem;}return relatives;}function updateRelatives(newPos){$.extend(rel,getRelatives(newPos));}function updateButtonsState(){var isStart=pos.dest<=pos.start;var isEnd=pos.dest>=pos.end;var slideePosState=isStart?1:isEnd?2:3;if(last.slideePosState!==slideePosState){last.slideePosState=slideePosState;if($prevPageButton.is('button,input')){$prevPageButton.prop('disabled',isStart);}if($nextPageButton.is('button,input')){$nextPageButton.prop('disabled',isEnd);}$prevPageButton.add($backwardButton)[isStart?'addClass':'removeClass'](o.disabledClass);$nextPageButton.add($forwardButton)[isEnd?'addClass':'removeClass'](o.disabledClass);}if(last.fwdbwdState!==slideePosState&&dragging.released){last.fwdbwdState=slideePosState;if($backwardButton.is('button,input')){$backwardButton.prop('disabled',isStart);}if($forwardButton.is('button,input')){$forwardButton.prop('disabled',isEnd);}}if(itemNav){var isFirst=rel.activeItem===0;var isLast=rel.activeItem>=items.length-1;var itemsButtonState=isFirst?1:isLast?2:3;if(last.itemsButtonState!==itemsButtonState){last.itemsButtonState=itemsButtonState;if($prevButton.is('button,input')){$prevButton.prop('disabled',isFirst);}if($nextButton.is('button,input')){$nextButton.prop('disabled',isLast);}$prevButton[isFirst?'addClass':'removeClass'](o.disabledClass);$nextButton[isLast?'addClass':'removeClass'](o.disabledClass);}}}self.resume=function(priority){if(!o.cycleBy||!o.cycleInterval||o.cycleBy==='items'&&!items[0]||priority<self.isPaused){return;}self.isPaused=0;if(cycleID){cycleID=clearTimeout(cycleID);}else{trigger('resume');}cycleID=setTimeout(function(){trigger('cycle');switch(o.cycleBy){case'items':self.activate(rel.activeItem>=items.length-1?0:rel.activeItem+1);break;case'pages':self.activatePage(rel.activePage>=pages.length-1?0:rel.activePage+1);break;}},o.cycleInterval);};self.pause=function(priority){if(priority<self.isPaused){return;}self.isPaused=priority||100;if(cycleID){cycleID=clearTimeout(cycleID);trigger('pause');}};self.toggle=function(){self[cycleID?'pause':'resume']();};self.set=function(name,value){if($.isPlainObject(name)){$.extend(o,name);}else if(o.hasOwnProperty(name)){o[name]=value;}};self.add=function(element,index){var $element=$(element);if(itemNav){if(index==null||!items[0]){$element.appendTo($slidee);}else if(items.length){$element.insertBefore(items[index].el);}if(index<=rel.activeItem){last.active=rel.activeItem+=$element.length;}}else{$slidee.append($element);}load();};self.remove=function(element){if(itemNav){var index=getRelativeIndex(element);if(index>-1){$items.eq(index).remove();var reactivate=index===rel.activeItem;if(index<rel.activeItem){last.active=--rel.activeItem;}load();if(reactivate){last.active=null;self.activate(rel.activeItem);}}}else{$(element).remove();load();}};function moveItem(item,position,after){item=getRelativeIndex(item);position=getRelativeIndex(position);if(item>-1&&position>-1&&item!==position&&(!after||position!==item-1)&&(after||position!==item+1)){$items.eq(item)[after?'insertAfter':'insertBefore'](items[position].el);var shiftStart=item<position?item:(after?position:position-1);var shiftEnd=item>position?item:(after?position+1:position);var shiftsUp=item>position;if(item===rel.activeItem){last.active=rel.activeItem=after?(shiftsUp?position+1:position):(shiftsUp?position:position-1);}else if(rel.activeItem>shiftStart&&rel.activeItem<shiftEnd){last.active=rel.activeItem+=shiftsUp?1:-1;}load();}}self.moveAfter=function(item,position){moveItem(item,position,1);};self.moveBefore=function(item,position){moveItem(item,position);};self.on=function(name,fn){if(type(name)==='object'){for(var key in name){if(name.hasOwnProperty(key)){self.on(key,name[key]);}}}else if(type(fn)==='function'){var names=name.split(' ');for(var n=0,nl=names.length;n<nl;n++){callbacks[names[n]]=callbacks[names[n]]||[];if(callbackIndex(names[n],fn)===-1){callbacks[names[n]].push(fn);}}}else if(type(fn)==='array'){for(var f=0,fl=fn.length;f<fl;f++){self.on(name,fn[f]);}}};self.one=function(name,fn){function proxy(){fn.apply(self,arguments);self.off(name,proxy);}self.on(name,proxy);};self.off=function(name,fn){if(fn instanceof Array){for(var f=0,fl=fn.length;f<fl;f++){self.off(name,fn[f]);}}else{var names=name.split(' ');for(var n=0,nl=names.length;n<nl;n++){callbacks[names[n]]=callbacks[names[n]]||[];if(fn==null){callbacks[names[n]].length=0;}else{var index=callbackIndex(names[n],fn);if(index!==-1){callbacks[names[n]].splice(index,1);}}}}};function callbackIndex(name,fn){for(var i=0,l=callbacks[name].length;i<l;i++){if(callbacks[name][i]===fn){return i;}}return-1;}function resetCycle(){if(dragging.released&&!self.isPaused){self.resume();}}function handleToSlidee(handlePos){return Math.round(within(handlePos,hPos.start,hPos.end)/hPos.end*(pos.end-pos.start))+pos.start;}function draggingHistoryTick(){dragging.history[0]=dragging.history[1];dragging.history[1]=dragging.history[2];dragging.history[2]=dragging.history[3];dragging.history[3]=dragging.delta;}function continuousInit(source){dragging.released=0;dragging.source=source;dragging.slidee=source==='slidee';}function dragInit(event){if(dragging.init||isInteractive(event.target)){return;}var isTouch=event.type==='touchstart';var source=event.data.source;var isSlidee=source==='slidee';if(source==='handle'&&(!o.dragHandle||hPos.start===hPos.end)){return;}if(isSlidee&&!(isTouch?o.touchDragging:o.mouseDragging&&event.which<2)){return;}if(!isTouch){stopDefault(event,1);}continuousInit(source);dragging.init=1;dragging.$source=$(event.target);dragging.touch=isTouch;dragging.pointer=isTouch?event.originalEvent.touches[0]:event;dragging.initX=dragging.pointer.pageX;dragging.initY=dragging.pointer.pageY;dragging.initPos=isSlidee?pos.cur:hPos.cur;dragging.start=+new Date();dragging.time=0;dragging.path=0;dragging.delta=0;dragging.locked=0;dragging.history=[0,0,0,0];dragging.pathToLock=isSlidee?isTouch?30:10:0;dragging.initLoc=dragging[o.horizontal?'initX':'initY'];dragging.deltaMin=isSlidee?-dragging.initLoc:-hPos.cur;dragging.deltaMax=isSlidee?document[o.horizontal?'width':'height']-dragging.initLoc:hPos.end-hPos.cur;$doc.on(isTouch?dragTouchEvents:dragMouseEvents,dragHandler);self.pause(1);(isSlidee?$slidee:$handle).addClass(o.draggedClass);trigger('moveStart');if(isSlidee){historyID=setInterval(draggingHistoryTick,10);}}function dragHandler(event){dragging.released=event.type==='mouseup'||event.type==='touchend';dragging.pointer=dragging.touch?event.originalEvent[dragging.released?'changedTouches':'touches'][0]:event;dragging.pathX=dragging.pointer.pageX-dragging.initX;dragging.pathY=dragging.pointer.pageY-dragging.initY;dragging.path=Math.sqrt(Math.pow(dragging.pathX,2)+Math.pow(dragging.pathY,2));dragging.delta=within(o.horizontal?dragging.pathX:dragging.pathY,dragging.deltaMin,dragging.deltaMax);if(!dragging.locked&&dragging.path>dragging.pathToLock){dragging.locked=1;if(o.horizontal?Math.abs(dragging.pathX)<Math.abs(dragging.pathY):Math.abs(dragging.pathX)>Math.abs(dragging.pathY)){dragging.released=1;}else if(dragging.slidee){dragging.$source.on(clickEvent,disableOneEvent);}}if(dragging.released){if(!dragging.touch){stopDefault(event);}dragEnd();if(o.releaseSwing&&dragging.slidee){dragging.swing=(dragging.delta-dragging.history[0])/40*300;dragging.delta+=dragging.swing;dragging.tweese=Math.abs(dragging.swing)>10;}}else if(dragging.locked||!dragging.touch){stopDefault(event);}slideTo(dragging.slidee?Math.round(dragging.initPos-dragging.delta):handleToSlidee(dragging.initPos+dragging.delta));}function dragEnd(){clearInterval(historyID);$doc.off(dragging.touch?dragTouchEvents:dragMouseEvents,dragHandler);(dragging.slidee?$slidee:$handle).removeClass(o.draggedClass);setTimeout(function(){dragging.$source.off(clickEvent,disableOneEvent);});self.resume(1);if(pos.cur===pos.dest&&dragging.init){trigger('moveEnd');}dragging.init=0;}function isInteractive(element){return~$.inArray(element.nodeName,interactiveElements)||$(element).is(o.interactive);}function movementReleaseHandler(){self.stop();$doc.off('mouseup',movementReleaseHandler);}function buttonsHandler(event){stopDefault(event);switch(this){case $forwardButton[0]:case $backwardButton[0]:self.moveBy($forwardButton.is(this)?o.moveBy:-o.moveBy);$doc.on('mouseup',movementReleaseHandler);break;case $prevButton[0]:self.prev();break;case $nextButton[0]:self.next();break;case $prevPageButton[0]:self.prevPage();break;case $nextPageButton[0]:self.nextPage();break;}}function normalizeWheelDelta(event){scrolling.curDelta=event.wheelDelta?-event.wheelDelta/120:(event.detail||event.deltaY)/3;if(!itemNav){return scrolling.curDelta;}time=+new Date();if(scrolling.last<time-scrolling.resetTime){scrolling.delta=0;}scrolling.last=time;scrolling.delta+=scrolling.curDelta;if(Math.abs(scrolling.delta)<1){scrolling.finalDelta=0;}else{scrolling.finalDelta=Math.round(scrolling.delta/1);scrolling.delta%=1;}return scrolling.finalDelta;}function scrollHandler(event){if(!o.scrollBy||pos.start===pos.end){return;}stopDefault(event,1);self.slideBy(o.scrollBy*normalizeWheelDelta(event.originalEvent));}function scrollbarHandler(event){if(o.clickBar&&event.target===$sb[0]){stopDefault(event);slideTo(handleToSlidee((o.horizontal?event.pageX-$sb.offset().left:event.pageY-$sb.offset().top)-handleSize/2));}}function keyboardHandler(event){if(!o.keyboardNavBy){return;}switch(event.which){case o.horizontal?37:38:stopDefault(event);self[o.keyboardNavBy==='pages'?'prevPage':'prev']();break;case o.horizontal?39:40:stopDefault(event);self[o.keyboardNavBy==='pages'?'nextPage':'next']();break;}}function activateHandler(event){if(isInteractive(this)){event.stopPropagation();return;}if(this.parentNode===$slidee[0]){self.activate(this);}}function activatePageHandler(){if(this.parentNode===$pb[0]){self.activatePage($pages.index(this));}}function pauseOnHoverHandler(event){if(o.pauseOnHover){self[event.type==='mouseenter'?'pause':'resume'](2);}}function trigger(name,arg1){if(callbacks[name]){l=callbacks[name].length;tmpArray.length=0;for(i=0;i<l;i++){tmpArray.push(callbacks[name][i]);}for(i=0;i<l;i++){tmpArray[i].call(self,name,arg1);}}}self.destroy=function(){$doc.add($scrollSource).add($handle).add($sb).add($pb).add($forwardButton).add($backwardButton).add($prevButton).add($nextButton).add($prevPageButton).add($nextPageButton).unbind('.'+namespace);$prevButton.add($nextButton).add($prevPageButton).add($nextPageButton).removeClass(o.disabledClass);if($items){$items.eq(rel.activeItem).removeClass(o.activeClass);}$pb.empty();if(!parallax){$frame.unbind('.'+namespace);$slidee.add($handle).css(transform||(o.horizontal?'left':'top'),transform?'none':0);$.removeData(frame,namespace);}items.length=pages.length=0;last={};self.initialized=0;return self;};self.init=function(){if(self.initialized){return;}self.on(callbackMap);var $movables=$handle;if(!parallax){$movables=$movables.add($slidee);$frame.css('overflow','hidden');if(!transform&&$frame.css('position')==='static'){$frame.css('position','relative');}}if(transform){if(gpuAcceleration){$movables.css(transform,gpuAcceleration);}}else{if($sb.css('position')==='static'){$sb.css('position','relative');}$movables.css({position:'absolute'});}if(o.forward){$forwardButton.on(mouseDownEvent,buttonsHandler);}if(o.backward){$backwardButton.on(mouseDownEvent,buttonsHandler);}if(o.prev){$prevButton.on(clickEvent,buttonsHandler);}if(o.next){$nextButton.on(clickEvent,buttonsHandler);}if(o.prevPage){$prevPageButton.on(clickEvent,buttonsHandler);}if(o.nextPage){$nextPageButton.on(clickEvent,buttonsHandler);}$scrollSource.on('DOMMouseScroll.'+namespace+' mousewheel.'+namespace,scrollHandler);if($sb[0]){$sb.on(clickEvent,scrollbarHandler);}if(itemNav&&o.activateOn){$frame.on(o.activateOn+'.'+namespace,'*',activateHandler);}if($pb[0]&&o.activatePageOn){$pb.on(o.activatePageOn+'.'+namespace,'*',activatePageHandler);}$dragSource.on(dragInitEvents,{source:'slidee'},dragInit);if($handle){$handle.on(dragInitEvents,{source:'handle'},dragInit);}$doc.bind('keydown.'+namespace,keyboardHandler);if(!parallax){$frame.on('mouseenter.'+namespace+' mouseleave.'+namespace,pauseOnHoverHandler);$frame.on('scroll.'+namespace,resetScroll);}load();if(o.cycleBy&&!parallax){self[o.startPaused?'pause':'resume']();}self.initialized=1;return self;};}function type(value){if(value==null){return String(value);}if(typeof value==='object'||typeof value==='function'){return Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase()||'object';}return typeof value;}function stopDefault(event,noBubbles){event.preventDefault();if(noBubbles){event.stopPropagation();}}function disableOneEvent(event){stopDefault(event,1);$(this).off(event.type,disableOneEvent);}function resetScroll(){this.scrollLeft=0;this.scrollTop=0;}function isNumber(value){return!isNaN(parseFloat(value))&&isFinite(value);}function getPx($item,property){return 0|Math.round(String($item.css(property)).replace(/[^\-0-9.]/g,''));}function within(number,min,max){return number<min?min:number>max?max:number;}(function(w){var vendors=['moz','webkit','o'];var lastTime=0;for(var i=0,l=vendors.length;i<l&&!cAF;++i){cAF=w[vendors[i]+'CancelAnimationFrame']||w[vendors[i]+'CancelRequestAnimationFrame'];rAF=cAF&&w[vendors[i]+'RequestAnimationFrame'];}if(!cAF){rAF=function(callback){var currTime=+new Date();var timeToCall=Math.max(0,16-(currTime-lastTime));lastTime=currTime+timeToCall;return w.setTimeout(function(){callback(currTime+timeToCall);},timeToCall);};cAF=function(id){clearTimeout(id);};}}(window));(function(){var prefixes=['','webkit','moz','ms','o'];var el=document.createElement('div');function testProp(prop){for(var p=0,pl=prefixes.length;p<pl;p++){var prefixedProp=prefixes[p]?prefixes[p]+prop.charAt(0).toUpperCase()+prop.slice(1):prop;if(el.style[prefixedProp]!=null){return prefixedProp;}}}transform=testProp('transform');gpuAcceleration=testProp('perspective')?'translateZ(0) ':'';}());w[className]=Sly;$.fn[pluginName]=function(options,callbackMap){var method,methodArgs;if(!$.isPlainObject(options)){if(type(options)==='string'||options===false){method=options===false?'destroy':options;methodArgs=Array.prototype.slice.call(arguments,1);}options={};}return this.each(function(i,element){var plugin=$.data(element,namespace);if(!plugin&&!method){plugin=$.data(element,namespace,new Sly(element,options,callbackMap).init());}else if(plugin&&method){if(plugin[method]){plugin[method].apply(plugin,methodArgs);}}});};Sly.defaults={horizontal:0,itemNav:null,itemSelector:null,smart:0,activateOn:null,activateMiddle:0,scrollSource:null,scrollBy:0,dragSource:null,mouseDragging:0,touchDragging:0,releaseSwing:0,swingSpeed:0.2,elasticBounds:0,interactive:null,scrollBar:null,dragHandle:0,dynamicHandle:0,minHandleSize:50,clickBar:0,syncSpeed:0.5,pagesBar:null,activatePageOn:null,pageBuilder:function(index){return'<li>'+(index+1)+'</li>';},forward:null,backward:null,prev:null,next:null,prevPage:null,nextPage:null,cycleBy:null,cycleInterval:5000,pauseOnHover:0,startPaused:0,moveBy:300,speed:0,easing:'swing',startAt:0,keyboardNavBy:null,draggedClass:'dragged',activeClass:'active',disabledClass:'disabled'};}(jQuery,window));