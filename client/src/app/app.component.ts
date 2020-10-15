import { Player } from './player';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import io from "socket.io-client";
import { Comida } from './comida';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  private socket: any;

  public players: Player[];
  public player: Player;

  public comidas: Comida[] = [];

  ngOnInit(): void {
    this.socket = io("http://localhost:1232");
  }

  ngAfterViewInit(): void {
    this.socket.on("position", position => {
      this.player = position;
      this.player.color = "#000";

      for(let i = 0; i < this.comidas.length; i++) {
        let comida = this.comidas[i];

        if (this.player.x < comida.x + 5 &&
          this.player.x + 20 > comida.x &&
          this.player.y < comida.y + 5 &&
          this.player.y + 20 > comida.y
        ) {
          this.comer(comida);
          break;
        }
      }
    });

    this.socket.on("update_players", players => {
      this.players = players.filter(x => x.username != this.player.username);
      this.players.forEach(x => {
        x.color = "#f00";
      });
    });

    this.socket.on("update_foods", foods => {
      this.comidas = foods;
    });
  }

  public move(direction: string) {
    this.socket.emit("move", direction);
  }

  private comer(comida: Comida) {
    this.socket.emit('score_up', comida)
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let key = event.key.toUpperCase();

    switch (key) {
      case 'A':
        this.move('left');
        break;

      case 'S':
        this.move('down');
        break;

      case 'D':
        this.move('right');
        break;

      case 'W':
        this.move('up');
        break;
    }
  }

}
