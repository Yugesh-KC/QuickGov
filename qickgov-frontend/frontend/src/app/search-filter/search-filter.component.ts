import { Component } from '@angular/core';
import { EntityService } from '../shared/entities.service';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import { Entity } from '../shared/entity.model';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.css'
})
export class SearchFilterComponent {
  entities: Entity[];
  constructor(private entityService: EntityService, private router: Router, private lser: LoginService) {

  }

  ngOnInit() {
    this.entities = this.entityService.getEntity();

    // this.filteredEntities = [...this.entities];  // Initialize filteredEntities to all entities
  }

  applyEntityFilter(entity: Entity) {

  }
}
