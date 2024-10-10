<b>Namngivningsguidelines:</b><br>
Använd camelcase

Font och ikoner:
GOOGLE FONTS
Font family ??
material icon .svg
fonts.google.com

CSS/HTML Struktur:
BEM, Block Element Modifier
ex block (en tabell)
      block__element (en unordered list)
          block__element-item (list items )
class = kalle
      class = kalle__kaka
          class = kalle__kaka-item

CSS: Plan struktur, ingen nesting.
.class {
styles.....
}
.enTillClass{
fler styles...
}

CSS globala variabler (root)

:root{
--color--background-primary: rgba(255.255.0.0.8);
--color--secondary: rgba(0.0.200.0.5);
--timer-fade: 200ms;
}

.class{
background: var(--color-background-primary);
}
.enKnapp:onhover{
delay: var(--timer-fade);
}
