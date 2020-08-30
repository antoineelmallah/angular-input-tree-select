import { Component, OnInit } from '@angular/core';
import { IDatasource, INoHierarquia } from './input-tree-select/input-tree-select.component';
import { of } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit {

  private _assuntos: IAssunto[] = [
    { id: '1',  idPai: '2',    nivel: 3, chave: 'CH1', hierarquia: 'CH3/CH2/CH1', assunto: 'Assunto 1'  },
    { id: '2',  idPai: '3',    nivel: 2, chave: 'CH2', hierarquia: 'CH3/CH2',     assunto: 'Assunto 2'  },
    { id: '3',  idPai: null,   nivel: 1, chave: 'CH3', hierarquia: 'CH3',         assunto: 'Assunto 3'  },
    { id: '4',  idPai: null,   nivel: 1, chave: 'CH4', hierarquia: 'CH4',         assunto: 'Assunto 4'  },
    { id: '5',  idPai: '3',    nivel: 2, chave: 'CH5', hierarquia: 'CH3/CH5',     assunto: 'Assunto 5'  },
    { id: '6',  idPai: '2',    nivel: 3, chave: 'CH6', hierarquia: 'CH3/CH2/CH6', assunto: 'Assunto 6'  },
    { id: '7',  idPai: '4',    nivel: 2, chave: 'CH7', hierarquia: 'CH4/CH7',     assunto: 'Assunto 7'  },
    { id: '8',  idPai: null,   nivel: 1, chave: 'CH8', hierarquia: 'CH8',         assunto: 'Assunto 8'  },
    { id: '9',  idPai: '5',    nivel: 3, chave: 'CH9', hierarquia: 'CH3/CH5/CH9', assunto: 'Assunto 9'  },
    { id: '10', idPai: '11',   nivel: 2, chave: 'CHa', hierarquia: 'CHs/CHa',     assunto: 'Assunto 10' },
    { id: '11', idPai: null,   nivel: 1, chave: 'CHs', hierarquia: 'CHs',         assunto: 'Assunto 11' },
    { id: '12', idPai: '7',    nivel: 3, chave: 'CHd', hierarquia: 'CH4/CH7/CHd', assunto: 'Assunto 12' },
    { id: '13', idPai: '11',   nivel: 2, chave: 'CHf', hierarquia: 'CHs/CHf',     assunto: 'Assunto 13' },
    { id: '14', idPai: '7',    nivel: 3, chave: 'CHg', hierarquia: 'CH4/CH7/CHg', assunto: 'Assunto 14' },
    { id: '15', idPai: '7',    nivel: 3, chave: 'CHh', hierarquia: 'CH4/CH7/CHh', assunto: 'Assunto 15' },
    { id: '16', idPai: '11',   nivel: 2, chave: 'CHj', hierarquia: 'CHs/CHj',     assunto: 'Assunto 16' },
    { id: '17', idPai: '11',   nivel: 2, chave: 'CHk', hierarquia: 'CHs/CHk',     assunto: 'Assunto 17' },
  ];

  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      assuntoPaiId: [null, []],
    });
  }

  get datasource(): IDatasource {
    return {
      getNoComFilhos: (id: any) => {
        console.log('Executou getNoComFilhos');
        const no = this.getNo(id);
        this.popularFilhos(no);
        return of(no);
      },
      getPrimeiroNivel: () => {
        console.log('Executou getPrimeiroNivel');
        return of(this._assuntos
          .filter(a => a.idPai === null)
          .map(a => this.assuntoParaNoHierarquia(a)));
      },
      popularFilhos: (no: INoHierarquia) => {
        console.log('Executou popularFilhos');
        this.popularFilhos(no);
        return of(true);
      }
    };
  }

  private popularFilhos(no: INoHierarquia): void {
    const filhos = this._assuntos
      .filter(a => a.idPai === no.id)
      .map(a => this.assuntoParaNoHierarquia(a));
    no.filhosPopulados = true;
    no.filhos = filhos;
  }

  private assuntoParaNoHierarquia(assunto: IAssunto): INoHierarquia {
    if (!assunto) return null;
    return {
      id: assunto.id,
      chave: assunto.chave,
      descricao: assunto.hierarquia,
      nivel: assunto.nivel,
      paiId: assunto.idPai,
      filhosPopulados: false,
      filhos: []
    };
  }

  private getNo(id: any): INoHierarquia {
    const assunto = this._assuntos.find(a => a.id === id);
    const no = this.assuntoParaNoHierarquia(assunto);
    if (assunto.idPai) {
      no.filhos.push(this.getNo(assunto.idPai));
    }
    return no;
  }

}

export interface IAssunto {
  id: string; 
  idPai: string;
  nivel: number;
  chave: string;
  hierarquia: string;
  assunto: string;
}