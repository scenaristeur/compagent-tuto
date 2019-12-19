//https://gist.github.com/ErikHellman/9e17f2ea6a78669294ef2af4bc3f5878
//https://vaadin.com/learn/tutorials/lit-element/lit-element-templating-properties-and-events
import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map'


class MyDialog extends LitElement {

  constructor () {
    super()
    this.opened = false
  }

  static get properties () {
    return {
      opened: {type: Boolean}
    }
  }

  render () {
    return html`
    <link href="css/fontawesome/css/all.css" rel="stylesheet">
    <link href="css/bootstrap/bootstrap.min.css" rel="stylesheet">
    <style>
    /* The Modal (background) */
    .modal {
      display: none; /* Hidden by default */
      position: fixed; /* Stay in place */
      z-index: 1; /* Sit on top */
      padding-top: 100px; /* Location of the box */
      left: 0;
      top: 0;
      width: 100%; /* Full width */
      height: 100%; /* Full height */
      overflow: auto; /* Enable scroll if needed */
      background-color: rgb(0,0,0); /* Fallback color */
      background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
    }
    /* Modal Content */
    .modal-content {
      background-color: #fefefe;
      margin: auto;
      padding: 20px;
      border: 1px solid #888;
      width: 80%;
    }
    .content{
      overflow = 'auto';
       maxHeight = '100px'
    }

    /* The Close Button */
    .close {
      color: #aaaaaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
    }

    .close:hover,
    .close:focus {
      color: #000;
      text-decoration: none;
      cursor: pointer;
    }

    .opened {
      display: flex;
    }
    .closed {
      display: none;
    }
    .dialog {
      flex-direction: column;
      border: 2px outset black;
      padding: 1em;
      margin: 1em;
    }
    .buttons {
      display: flex;
      flex-direction: row;
    }
    .accept {
      justify-content: space-around;
      align-content: space-around;
    }
    .cancel {
      justify-content: space-around;
      align-content: space-around;
    }
    </style>


    <div class="${classMap({dialog: true, opened: this.opened, closed: !this.opened, modal: true})}">
    <div class="modal-content">
    <h1 class="title ">Title
    <span @click="${() => this.dispatchEvent(new CustomEvent('dialog.cancel'))}" class="close">&times;</span>
    </h1>
     <p class="content">This is a dialog
["Pork pancetta ham hock hamburger jerky frankfurter.  Filet mignon brisket ham hock tongue, spare ribs cupim picanha shoulder chicken short ribs biltong.  Beef ribs brisket andouille bacon fatback meatloaf kevin sausage boudin landjaeger ball tip pork loin kielbasa short ribs.  Porchetta sirloin sausage spare ribs pork chop, cupim alcatra chuck flank ham burgdoggen short ribs short loin.  Ham brisket biltong, beef ribs turkey filet mignon sirloin.  Tail chuck sirloin biltong pork belly turducken, cow rump strip steak.","Jerky tail turducken, drumstick pork buffalo salami kevin ground round jowl prosciutto beef pork loin.  Salami bacon jerky pork loin pork picanha chicken, flank filet mignon ham hock swine hamburger bresaola shankle ground round.  Landjaeger tail swine ribeye tongue, pork chop rump.  Leberkas sirloin venison, turducken filet mignon chislic salami.  Brisket kevin fatback ribeye flank cupim chuck.  Pork loin frankfurter shoulder strip steak, drumstick shankle buffalo pancetta.  Capicola beef ribs short loin beef.","Sirloin cupim turducken short ribs cow porchetta shank pastrami.  Meatball pig short loin jerky short ribs.  Shankle burgdoggen pig sausage beef ribs short loin brisket tail salami meatball leberkas pork loin.  Short ribs corned beef bacon shank leberkas alcatra drumstick bresaola.  Meatball tongue sausage beef ribs andouille hamburger salami cupim capicola tenderloin swine chislic pastrami pork.  Filet mignon boudin pig meatloaf.","Fatback salami shank boudin burgdoggen frankfurter alcatra.  Tri-tip leberkas buffalo turkey ribeye sausage.  Ham fatback tongue picanha.  Prosciutto pancetta ham corned beef, burgdoggen pig ham hock meatloaf sirloin filet mignon pastrami hamburger strip steak bacon.  T-bone rump pig pork, capicola chicken frankfurter burgdoggen hamburger chislic kielbasa alcatra.","Jerky andouille bresaola picanha.  Chicken brisket ribeye, picanha chislic beef ball tip bacon porchetta tongue.  Pork bresaola ribeye tail cupim landjaeger chicken.  Chislic tongue venison cupim brisket beef flank alcatra.  Buffalo short loin fatback brisket capicola shankle corned beef doner.","Filet mignon jowl sirloin drumstick chuck leberkas.  Shank burgdoggen meatball, landjaeger shankle ham hock tri-tip pork loin chislic pig kevin porchetta hamburger boudin.  Swine shankle chislic, frankfurter pancetta pastrami biltong brisket venison cow flank bacon beef ribs ham hock.  Beef ribs ham kevin andouille turducken pastrami tongue salami rump.  Alcatra flank fatback tongue filet mignon beef ribs bacon chislic ribeye.","Kevin landjaeger ham hock buffalo doner sirloin beef pastrami tenderloin.  Ham hock chuck spare ribs rump, chicken pancetta jowl swine corned beef doner chislic cupim short loin tenderloin shoulder.  Turducken burgdoggen chuck, bresaola turkey picanha shank.  Doner beef ball tip prosciutto ham shank.","Flank cow kevin, landjaeger prosciutto swine tongue beef drumstick boudin.  Ham pork chop capicola short ribs, frankfurter alcatra tenderloin biltong.  Short ribs sausage pancetta boudin turducken.  Picanha pig bacon buffalo rump pork loin ham hock cow porchetta pork alcatra sirloin boudin.  Leberkas chislic shankle, pork belly turkey drumstick boudin tri-tip biltong.","Biltong kevin shoulder short loin, tongue shank cupim chicken pork jerky burgdoggen ground round alcatra pastrami.  Pork tenderloin capicola bacon.  Tail kielbasa chislic meatloaf alcatra.  Prosciutto pig chuck bresaola.","Andouille chicken shoulder, sirloin ribeye chislic prosciutto tenderloin doner picanha tongue ball tip.  Ball tip swine tenderloin andouille pork chop fatback jerky cupim venison biltong pork beef ribs strip steak.  Meatball drumstick andouille, landjaeger corned beef ham tail pork prosciutto.  Filet mignon prosciutto chuck pork belly fatback drumstick.  Strip steak pancetta shank, flank venison drumstick shankle salami tenderloin beef.  Brisket drumstick hamburger ball tip, shank ground round t-bone shankle alcatra.","Pork burgdoggen meatloaf, pork belly kielbasa pork chop pancetta beef ribs frankfurter jowl leberkas porchetta ham swine.  Porchetta leberkas rump ribeye prosciutto pancetta meatball picanha.  Chicken short ribs ham swine, chuck ham hock pork chop pancetta ball tip cow.  Strip steak cupim leberkas, venison buffalo pancetta spare ribs pork fatback jowl doner porchetta bacon tenderloin.  Meatball andouille short loin alcatra chicken cow rump swine corned beef hamburger shoulder tongue.  Jerky chicken pork, biltong boudin cow beef ribs tongue tail pancetta t-bone bacon shoulder.  Pork loin hamburger ham hock, venison beef ham tongue turkey shankle.","Doner bacon picanha, burgdoggen chicken buffalo beef pancetta flank shoulder.  Pig pork loin sirloin, leberkas chicken pork hamburger.  Alcatra bresaola pastrami turducken, swine sirloin pork picanha strip steak chicken fatback bacon prosciutto t-bone rump.  Drumstick meatloaf tail turducken ribeye kevin alcatra, biltong jowl fatback swine capicola chislic rump sirloin.  Pork belly sausage biltong ball tip pork chop.  Beef tail leberkas ribeye venison, cow sausage spare ribs chicken meatball chuck pork loin.","Burgdoggen ham salami drumstick, leberkas pancetta chuck boudin porchetta pig capicola swine venison.  Pancetta venison spare ribs bacon cupim filet mignon corned beef, ball tip pig.  T-bone strip steak meatloaf filet mignon biltong shank meatball chuck corned beef landjaeger.  Tongue ham chicken, swine picanha shank ribeye.  Fatback meatloaf ribeye brisket, boudin short loin t-bone picanha shankle meatball.  Ground round pork rump pig.","Bacon meatball cow brisket pig, swine kevin chicken beef ribs alcatra prosciutto strip steak short loin capicola.  Pancetta meatball chislic, salami turkey jerky tri-tip venison t-bone pig beef ribs.  Pork loin landjaeger turkey ground round cow shankle beef ribs prosciutto.  Hamburger biltong buffalo cupim, venison beef pig shankle frankfurter.","Sirloin chuck doner short loin, alcatra ham hock sausage.  Ball tip meatloaf biltong cow turkey.  Pig turkey biltong, filet mignon meatloaf rump bresaola strip steak burgdoggen tail beef ribs sausage tri-tip jerky brisket.  Ribeye tail pancetta ball tip, shank alcatra pork loin pig hamburger pastrami frankfurter.","Brisket pork loin meatloaf chuck beef ribs alcatra turducken tail boudin shoulder picanha andouille pork belly jowl.  Buffalo fatback pig biltong cupim t-bone shank chuck pork loin jowl jerky.  Turkey beef ribs capicola, pork belly drumstick prosciutto hamburger chislic.  Brisket chislic beef ribs jerky, tail hamburger tri-tip salami kielbasa alcatra sausage landjaeger.  Pig tongue brisket, meatloaf spare ribs shoulder alcatra drumstick jowl.","Venison sausage turducken pork loin meatloaf, biltong filet mignon.  Beef ribs ground round pork belly buffalo ham hock doner tongue jowl bresaola cow frankfurter corned beef prosciutto.  Beef shankle strip steak frankfurter prosciutto shoulder rump.  Shoulder frankfurter beef ribs meatloaf prosciutto jowl salami, landjaeger boudin pastrami jerky picanha doner chicken.","Meatloaf swine cow shank biltong capicola, andouille short ribs pork chop t-bone buffalo short loin ham hock.  Shank frankfurter chislic pork belly pancetta meatloaf.  Beef porchetta capicola flank, ribeye tongue meatball beef ribs short loin.  Hamburger biltong jerky, turducken sausage ham hock t-bone andouille sirloin kevin ground round.","Strip steak doner buffalo short loin cow tenderloin.  Pork shankle jerky picanha swine alcatra.  Alcatra fatback jowl sausage.  Beef ribs burgdoggen shank cupim meatloaf tenderloin shoulder doner.  Kevin short loin rump tenderloin beef, kielbasa shankle frankfurter ham meatloaf bacon.  Frankfurter buffalo filet mignon t-bone brisket swine.","Capicola kielbasa tri-tip buffalo pancetta tenderloin turducken leberkas drumstick ham salami pork loin tongue.  Ham cow porchetta ribeye landjaeger pork chop cupim, short loin andouille turducken meatball buffalo pastrami hamburger t-bone.  Picanha buffalo shankle capicola jerky, pork chop cupim tenderloin ball tip t-bone frankfurter swine.  Chislic alcatra filet mignon, landjaeger boudin brisket drumstick cow bacon kielbasa meatloaf sausage.  Meatloaf pancetta landjaeger tail, alcatra chuck t-bone short ribs kevin prosciutto tenderloin drumstick picanha andouille jerky.  Short loin pork pig, swine meatloaf sirloin boudin burgdoggen corned beef.  Sausage meatball pork loin biltong sirloin frankfurter corned beef chuck alcatra pastrami ham hock brisket ground round shoulder bresaola."]

     </p>
    <div class="buttons">
    <button class="accept" @click="${() => this.dispatchEvent(new CustomEvent('dialog.accept'))}">Ok</button>
    <button class="cancel" @click="${() => this.dispatchEvent(new CustomEvent('dialog.cancel'))}">Cancel</button>
    </div>
    </div>
    </div>`
  }
}

customElements.define('my-dialog', MyDialog)
