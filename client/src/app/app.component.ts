import { Player } from './player';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import io from "socket.io-client";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  private socket: any;

  public players: Player[];
  public player: Player;

  ngOnInit(): void {
    this.socket = io("http://localhost:1232");
  }

  ngAfterViewInit(): void {
    this.socket.on("position", position => {
      this.player = position;
      this.player.color = "#000";
    });

    this.socket.on("update_players", players => {
      this.players = players.filter(x => x.username != this.player.username);
      this.players.forEach(x => {
        x.color = "#f00";
      });
    });
  }

  public move(direction: string) {
    this.socket.emit("move", direction);
  }

}
