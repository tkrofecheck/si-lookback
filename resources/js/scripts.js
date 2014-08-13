$(document).ready(function() {
   
    $('#bookmarkme').click(function(e) {
        e.preventDefault();
                           
        if (window.sidebar && window.sidebar.addPanel) { // Mozilla Firefox Bookmark
            window.sidebar.addPanel(document.title,window.location.href,'');
        } else if(window.external && ('AddFavorite' in window.external)) { // IE Favorite
            try {
                window.external.AddFavorite(location.href,document.title);
            }
            catch(e){}
        } else if(window.opera && window.print) { // Opera Hotlist
            this.title=document.title;
            return true;
        } else { // browsers not supported above (chrome, safari, Firefox24, etc.)
            alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
        }
    });

    var page = {
        "TEST_MODE" : false, // this is set based on domain (data file to edit when in TEST_MODE: issue_dev.json)
        "issueData" : null,
        "catNum" : null,
        "serverTime" : null,
        "defaultCategory" : null,
        "sliderIndex" : 0,
        "checkDomain" : function() {
            if (/\/prod\/assets\//.test(window.location.pathname)) {
                /* PROD */
                this.TEST_MODE = false;
            } else {
                /* ENVIRONMENT other than PROD */
               this.TEST_MODE = true;
            }
        },
        "getData" : function(filename) {
            var that = this,
                filename = (this.TEST_MODE) ? "issues_dev.json" : "issues.json",
                dataUrl = "resources/data/" + filename;
            
            $.ajax({
                type: "GET",
                cache: false,
                url: dataUrl,
                dataType: "json",
                success: function(data) { that.issueData = data; }
            });
        },
        "dateFromISO" : function(s) {
            s = s.split(/\D/);
            return new Date(Date.UTC(s[0], --s[1]||'', s[2]||'', s[3]||'', s[4]||'', s[5]||'', s[6]||''));
        },
        "setupSlider" : function() {
           var that = this;
           
            /* Slider Options Info: http://bxslider.com/options */
           $('.bxslider1').bxSlider({
                mode: 'fade',  // 'horizontal', 'vertical', or 'fade'
                infiniteLoop: false,
                hideControlOnEnd: true,
                pager: false,
                startSlide: that.sliderIndex,
                touchEnabled: false
            });
            
            $('.bxslider2').bxSlider({
                mode: 'fade',  // 'horizontal', 'vertical', or 'fade'
                infiniteLoop: false,
                hideControlOnEnd: true,
                pager: false,
                startSlide: that.sliderIndex,
                preloadImages: 'all',
                touchEnabled: false
            });
            
            $('.bxslider3').bxSlider({
                mode: 'fade',  // 'horizontal', 'vertical', or 'fade'
                infiniteLoop: false,
                hideControlOnEnd: true,
                pager: false,
                startSlide: that.sliderIndex,
                preloadImages: 'all',
                touchEnabled: false
            });
            
            $(".bx-wrapper").each(function(i){
                $(this).attr("id","bx-wrapper"+i);
                if (i>0) {
                    $("#bx-wrapper"+i+" a.bx-next").css("visibility","hidden");
                    $("#bx-wrapper"+i+" a.bx-prev").css("visibility","hidden");
                }
            });
            
            $("#bx-wrapper0 a.bx-next").click(function() {
                $("#bx-wrapper1 a.bx-next").trigger("click");
                $("#bx-wrapper2 a.bx-next").trigger("click");
            });
            
            $("#bx-wrapper0 a.bx-prev").click(function() {
                $("#bx-wrapper1 a.bx-prev").trigger("click");
                $("#bx-wrapper2 a.bx-prev").trigger("click");
            });
        },
        "drawPanels" : function() {
            var that = this,
                categoriesUL = $("#categories"),
                issuesUL = $("#issues"),
                checkCopyUL = $("#checkText"),
                c = 0, ignored = 0,
                categorySdate, categoryEdate, categoryLI, hdrDiv, hdrCopyDiv,            // Category Variables
                issueLI, issueDiv, dateDiv, coverImg, readAnchorHref, readAnchor, checkText;    // Issue Variables
            
            $.each(that.issueData.category, function(i, item) {
                categorySdate = new Date(that.dateFromISO(this.categoryDisplayDate.start)).getTime();
                categoryEdate = new Date(that.dateFromISO(this.categoryDisplayDate.end)).getTime();
                //console.log(that.serverTime + " >= " + categorySdate + " : " + (that.serverTime >= categorySdate));
                //console.log(that.serverTime + " <= " + categoryEdate + " : " + (that.serverTime <= categoryEdate));
                
                if ((that.serverTime >= categorySdate) && !this.TEST_MODE) {
                    categoryLI = $("<li></li>");
                    $(categoryLI).attr("id","category"+this.categoryNumber).addClass("fade-in");
                    
                    if ((that.serverTime >= categorySdate) && (that.serverTime <= categoryEdate)) {
                        // This category should be displayed on page load
                        that.defaultCategory = "category"+this.categoryNumber;
                        that.sliderIndex = c;
                        //console.log("category displayed: " + that.defaultCategory);
                        //console.log("slider index: " + that.sliderIndex);
                    }
                    
                    hdrDiv = $("<div></div>");
                    $(hdrDiv).addClass("hdr").html("#" + this.categoryNumber + ": ");
                    that.catNum = this.categoryNumber;
                    
                    hdrDivSpan = $("<span></span>");
                    $(hdrDivSpan).html(this.categoryTitle);
                    $(hdrDiv).append($(hdrDivSpan));
                    
                    hdrCopyDiv = $("<div></div>");
                    $(hdrCopyDiv).addClass("hdr-copy").html(this.categoryDesc);
                    
                    $(categoryLI).append($(hdrDiv));
                    $(categoryLI).append($(hdrCopyDiv));
                    $(categoriesUL).append($(categoryLI));
                   
                    issueLI = $("<li></li>");
                    $.each(this.issue, function(i, item) {
                        issueDiv = $("<div></div>");
                        $(issueDiv).addClass("issue-box").addClass("shadow");
                        
                        dateDiv = $("<div></div>");
                        $(dateDiv).addClass("issue-date").html(this.issueDate);
                        
                        coverImg = $("<img/>");
                        $(coverImg).attr("src","resources/images/" + that.catNum + "/" + this.issueCover).addClass("issue-cvr").addClass("shadow");
                        
                        
                        readAnchor = $("<a></a>");
                        readAnchorHref = "javascript:openPopup('http://sportsillustrated.cnn.com/vault/edb/reader.html?magID=SI&issueDate=" + this.issueReaderIssueDate + "&mode=reader_vault','Reader','width=800,height=600,directories=no,location=no,status=no,scrollbars=no,resizable=yes,menubar=no,toolbar=no')";
                        $(readAnchor).attr({
                            "href" : readAnchorHref,
                            "onclick" : "omniPage('Lookback page – issue: " + this.issueDate + "');"
                        });
                        
                        readAnchorImg = $("<img/>");
                        $(readAnchorImg).attr("src","resources/images/btn-read-issue.png").addClass("btn");
                        
                        $(readAnchor).append($(readAnchorImg));
                        $(issueDiv).append($(dateDiv));
                        $(issueDiv).append($(coverImg));
                        $(issueDiv).append($(readAnchor));
                        $(issueLI).append($(issueDiv));
                    });
                    $(issuesUL).append($(issueLI)).show();
                    
                    checkTextLI = $("<li></li>");
                    $(checkTextLI).html(this.checkText);
                    $(checkCopyUL).addClass("check").append($(checkTextLI));
                } else {
                    ignored++;
                }
                c++;
            });
            
            this.setupSlider();
            //console.log("ignored: " + ignored);
        },
        "build" : function() {
            var that = this;
            
            this.checkDomain();
            this.getData();
            
            var drawPanelInterval = setInterval(function() {
                if (that.issueData && serverTime.time) {
                    clearInterval(drawPanelInterval);
                    that.serverTime = new Date(that.dateFromISO(serverTime.time)).getTime();
                    that.drawPanels();
                }
            }, 100); // setInterval cannot be 0 in order to run in IE7/IE8
        }
    };
    
    page.build();
});

