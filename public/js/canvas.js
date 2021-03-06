const api = "https://postitaltspace.herokuapp.com/api";
//const api = "http://localhost:3000/api";
const colors = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e", "#f1c40f", "#e67e22", "#e74c3c", "#2d3436", "#dfe6e9"]

var postits = []
var selectedPost = null;
var insertPostInputField = null;
var buttonsType = null;
var buttonPostit = null;
var buttonText = null;
var updatingPost = false;

jQuery(document).ready(function($){
    start();
    $("body").click(function(e) {
        if (e.target.nodeName === "BODY")
            cancelAdd();
    });
    $("body").dblclick(function(e) {
        if (e.target.nodeName === "BODY")
            addInput(e, this);
    });
    buttonsType = $("#buttons-type");
    buttonsType.hide();
    buttonPostit = $("#button-text");
    buttonPostit.click(function(e) {
        setSelectedItemType("text");
    });
    buttonText = $("#button-postit");
    buttonText.click(function(e) {
        setSelectedItemType("postit");
    });
});
function hex(x) {
  return ("0" + parseInt(x).toString(16)).slice(-2);
}
function rgb2hex(rgb) {
 rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*\d+\.*\d+)?\)$/);
 return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
function addInput(e, el)
{
    if (updatingPost == true)
        return;
    cancelAdd();

    var x = 0;
    var y = 0;
    var hasPost = false;

    if (e.target?.nodeName === "BODY")
    {
        x = e.pageX - el.offsetLeft;
        y = e.pageY - el.offsetTop;
    }
    else //'e' as post
    {
        x = e.position.x;
        y = e.position.y;
        hasPost = true;
        updatingPost = true;
        e.element.hide();
    }
        
    insertPostInputField = $('<div/>',{
        class: 'input-post'
    }).appendTo('body')
    insertPostInputField.css({top: y, left: x});
    insertPostInputField.draggable();

    var inputField = $('<textarea/>', {
        class: 'title-field'
    }).appendTo(insertPostInputField);
    inputField.focus();

    var inputFieldDescription = $('<textarea/>', {
        class: 'description-field',
        placeholder: 'Postit Description',
        rows: 5
    }).appendTo(insertPostInputField);

    if (hasPost)
    {
        insertPostInputField.css( "background-color", e.element.css("background-color") );
        inputField.val(e.text);
        inputFieldDescription.val(e.description);
    }

    var addButton = $('<button/>', {
        text: hasPost ? 'Atualizar' : 'Criar'
    }).appendTo(insertPostInputField);
    addButton.click(function(evnt) {
        const position = insertPostInputField.position();
        const size = insertPostInputField.width();
        const color = rgb2hex(insertPostInputField.css( "background-color" ));
        const description = inputFieldDescription.val();

        if (hasPost)
        {
            e.description = description;
            e.element.css('background-color', color);
            e.element.css({top: position.top, left: position.left});
            e.element.text(inputField.val());
            e.element.show();
            updatePost(e);
        }
        else
        {
            createPost(inputField.val(), description, color, position.left, position.top, size + 20);
        }
    })
    var buttonsColor = $('<div/>', {
        class: 'button-container'
    }).appendTo(insertPostInputField);
    colors.forEach(color => {
        var button = $('<button/>', {
            class: 'button-item-container'
        }).appendTo(buttonsColor);
        button.css("background-color", color);
        button.click(function(e){
            insertPostInputField.css("background-color", color);
        });
    });

    /*var buttonsSize = $('<div/>', {
        class: 'button-container-vertical'
    }).appendTo(insertPostInputField);

    var plusButton = $('<button/>', {
        text: '+',
        class: 'button-item-container'
    }).appendTo(buttonsSize);
    plusButton.click(function(e){
        const size = insertPostInputField.width() + 60;
        insertPostInputField.css("width", size + 'px');
        insertPostInputField.css("height", size + 'px');
    });

    var minusButton = $('<button/>', {
        text: '-',
        class: 'button-item-container'
    }).appendTo(buttonsSize);
    minusButton.click(function(e){
        const size = insertPostInputField.width() - 5;
        insertPostInputField.css("width", size);
        insertPostInputField.css("height", size);
    });*/
}

function cancelAdd()
{
    if (updatingPost == true)
        return;

    insertPostInputField?.remove();
    selectedPost?.element.removeClass('selected')
    selectedPost = null
    buttonsType.hide();
    updatingPost = false;
}

function start()
{
    const params = new URLSearchParams(window.location.search);
    if (!params.has("section"))
    {
        alert("Section not found!!");
        return;
    }
    loadPosts();
}

async function loadPosts()
{
    clear();
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");

    const rawResponse = await fetch(`${api}/post?section=${section}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const content = await rawResponse.json();
    postits = content;
    draw();
}
function clear() {
    postits?.forEach(p => p.element?.remove());
}
function setSelectedItemType(type) {
    selectedPost.type = type;
    updatePost(selectedPost);
    cancelAdd();
    clear();
    draw();
}
// redraw the scene
function draw() {
    // redraw each rect in the rects[] array
    for (var i = 0; i < postits.length; i++) {
        const r = postits[i];
        r.element = $('<div/>',{
            text: r.text,
            class: 'postit'
        }).appendTo('body')
        r.element.attr("tabindex", 0);
        r.element.draggable();

        if (r.type == "postit")
        {
            r.element.css('background-color', r.color);
            r.element.css('width', r.size.x);
            r.element.css('height', r.size.y);
        }
        if (r.type == "text")
        {
            r.element.addClass("text");
            r.element.css('color', r.color);
        }

        r.element.css('left', r.position.x);
        r.element.css('top', r.position.y);
        r.element.on('dragstop', function(e) { updatePost(r); })
        r.element.on('click', function(e) {
            cancelAdd();
            selectedPost?.element.removeClass('selected')
            selectedPost = r;
            selectedPost.element.addClass('selected');
            selectedPost.element.focus();

            buttonsType.show();
            buttonPostit.css("background-color", r.type=="text" ? "#3498db" : "#95a5a6");
            buttonText.css("background-color", r.type=="postit" ? "#3498db" : "#95a5a6");
        });
        r.element.on('dblclick', function(e) {
            addInput(r);
        });
        r.element.on('keydown', function(e) {
            const key = e.which || e.keyCode;
            if (selectedPost != r)
                return;
            if (key === 46) {
                selectedPost = null;
                deletePost(r);
            }
        });
        postits[i] = r;
    }
}


async function createPost(text, description, color, x, y, size)
{
    var post = {
        text: text,
        description: description,
        position: {
            x,
            y
        },
        size: {
            x: size,
            y: size
        },
        color: color,
        type: "postit"
    }

    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    const rawResponse = await fetch(`${api}/post?section=${section}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
    });
    const content = await rawResponse.json();
    postits.push(content);
    console.log("Adicionado!");
    cancelAdd();
    clear();
    draw();
}
async function updatePost(post) {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    const position = post.element.position();
    const color = rgb2hex(post.element.css( "background-color" ));
    post.position = {
        x: position.left,
        y: position.top
    }
    post.text = post.element.text();
    post.color = color;
    const rawResponse = await fetch(`${api}/post/${post.id}?section=${section}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
    });
    console.log("Atualizado!");
    updatingPost = false;
    cancelAdd();
}

async function deletePost(post) {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    const rawResponse = await fetch(`${api}/post/${post.id}?section=${section}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const index = postits.indexOf(post);
    postits.splice(index, 1);
    post.element.remove();
    console.log("Deletado!");
    clear();
    draw();
}


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}