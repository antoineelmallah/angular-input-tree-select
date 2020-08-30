import { Component, OnInit, Input, AfterViewInit, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'input-tree-select',
  templateUrl: './input-tree-select.component.html',
  styleUrls: ['./input-tree-select.component.css'],
  providers:
    [ { 
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => InputTreeSelectComponent),
  }],

})
export class InputTreeSelectComponent implements ControlValueAccessor, AfterViewInit {

  @Input() datasource: IDatasource;

  private _idSelect: string = null;

  get idSelect(): string {
    return this._idSelect;
  }

  set idSelect(id: string) {
    if (id) this.idSelecionado = id; 
    this._idSelect = null;
  }

  private _idSelecionado = new BehaviorSubject<string>(null);

  get idSelecionado() {
    return this._idSelecionado.value;
  }

  set idSelecionado(id: string) {
    this.noSelecionado = this.getCachePorId(id);
    this.popularFilhos(this.noSelecionado);
    this._idSelecionado.next(id);
    this.idSelect = null;
  }

  noSelecionado: INoHierarquia;

  private cachePorNiveis: Map<number, INoHierarquia[]> = new Map();

  private getCachePorId(id: string): INoHierarquia {
    for (let i = 1; i <= this.cachePorNiveis.size; i++) {
      const v = this.cachePorNiveis.get(i);
      const no = v.find(i => String(i.id) === id);
      if (no) {
        return no;
      }
    }
    return null;
  }

  private adicionarAoCache(nos: INoHierarquia[]): void {
    nos.forEach(no => {
      let lista = this.cachePorNiveis.get(no.nivel);
      if (!lista) {
        lista = [];
        this.cachePorNiveis.set(no.nivel, lista);
      }
      const idx = lista.findIndex(i => i.id === no.id);
      if (idx >= 0) {
        lista[idx] = no;
      } else {
        lista.push(no);
      }
    });
  }

  private filhosPrimeiroNivel: INoHierarquia[] = [];

  get filhos(): INoHierarquia[] {
    if (this.noSelecionado) {
      if (!this.noSelecionado.filhosPopulados) {
        this.popularFilhos(this.noSelecionado);
      }
      return this.noSelecionado.filhos;
    }
    return this.filhosPrimeiroNivel;
  }

  get nos(): INoHierarquia[] {
    let no = this.noSelecionado;

    if (!no) return [];

    const nos: INoHierarquia[] = [];
    nos.push(no);
    while (no.paiId) {
      const pai = this.getCachePorId(no.paiId);
      nos.push(pai);
      no = pai;
    }
    return nos.reverse();
  }

  get nivel(): number {
    return this.nos.length + 1;
  }

  disabled: boolean;

  constructor() { }

  ngAfterViewInit() {
    this.datasource.getPrimeiroNivel().subscribe(nos => {
      this.filhosPrimeiroNivel.push(...nos);
      this.cachePorNiveis.set(1, nos);
    });
  }

  selecionar(id: string) {
    this.idSelecionado = id;
    this.idSelect = null;
  }

  limpar() {
    this.idSelecionado = null;
  }

  private popularFilhos(no: INoHierarquia): void {
    if (!no) return;
    if (!no.filhosPopulados) {
      this.datasource.getFilhos(no.id).subscribe(filhos => {
        if (filhos) {
          no.filhosPopulados = true;
          no.filhos = filhos;
          this.adicionarAoCache(filhos);
        }
      });
    }
  }

  // Implementação de ControlValueAccessor
  writeValue(id: string): void {
    this.idSelecionado = id;
    if (id) {
      this.datasource.getNoComFilhosEPais(id).subscribe(nos => {
        this.adicionarAoCache(nos);
        const no = nos.reduce((ant, corr, idx) => ant.nivel > corr.nivel ? ant : corr);
        this.noSelecionado = this.getCachePorId(no.id);
      });
    }
  }

  registerOnChange(fn: any): void {
    this._idSelecionado.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this._idSelecionado.subscribe(fn);
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}

export interface INoHierarquia {
  id: string;
  chave: string;
  descricao: string;
  nivel: number;
  paiId?: string;
  filhosPopulados: boolean;
  filhos: INoHierarquia[];
}

export interface IDatasource {
  getNoComFilhosEPais(id: string): Observable<INoHierarquia[]>;
  getPrimeiroNivel(): Observable<INoHierarquia[]>;
  getFilhos(id: string): Observable<INoHierarquia[]>;
}