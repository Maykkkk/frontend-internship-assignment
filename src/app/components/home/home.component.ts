import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, filter, switchMap, ReplaySubject,map, distinctUntilChanged, Observable, of } from 'rxjs';

@Component({
  selector: 'front-end-internship-assignment-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  bookSearch: FormControl;
  searchResults: any[] = [];
  currentPage: number = 1;
  totalResults: number = 0;
  pageSize: number = 10;
  noResultsMessage: string = '';
  isLoading: boolean = false;
  showNoResults: boolean = false;

  constructor(private http: HttpClient) {
    this.bookSearch = new FormControl('');
  }

  trendingSubjects: Array<any> = [
    { name: 'JavaScript' },
    { name: 'CSS' },
    { name: 'HTML' },
    { name: 'Harry Potter' },
    { name: 'Crypto' },
  ];

  ngOnInit(): void {
    this.bookSearch.valueChanges
      .pipe(
        debounceTime(300),
        switchMap((searchTerm: string) => this.searchBooks(searchTerm))
      )
      .subscribe((results: any) => {
        // Handle the search results here
        console.log(results);
      });
  }

  searchBooks(searchTerm: string) {
    const apiUrl = `https://openlibrary.org/dev/docs/api/search`;

    return this.http.get(apiUrl);
  }

  performSearch(): void {
    const searchTerm = this.bookSearch.value.trim();
    if (!searchTerm) {
      // Handle empty search term
      this.searchResults = [];
      this.totalResults = 0;
      return;
    }
    this.isLoading = true; // Set isLoading to true
    const apiUrl = `https://openlibrary.org/search.json?q=${searchTerm}&limit=${this.pageSize}&offset=${(this.currentPage - 1) * this.pageSize}`;
    
  
    this.http.get(apiUrl).subscribe(
      (response: any) => {
        this.searchResults = response.docs;
        this.totalResults = response.num_found;
        this.isLoading = false; // Set isLoading to false
        if (this.searchResults.length === 0) {
          this.showNoResults = true; // Set showNoResults to true
        } else {
          this.showNoResults = false; // Set showNoResults to false
        }
      },
      (error) => {
        this.isLoading = false; // Set isLoading to false in case of error
        console.log('Error occurred:', error);
      }
    );
  }
  

  private updateSearchResults(response: any): void {
    if (response.docs.length === 0) {
      // Display a message indicating no results were found
      this.searchResults = [];
      this.totalResults = 0;
      this.noResultsMessage = 'No results found.';
    } else {
      this.searchResults = response.docs;
      this.totalResults = response.num_found;
      this.noResultsMessage = '';
    }
  }

  onSearchInputChange(): void {
    this.currentPage = 1;
    this.debouncedSearch().subscribe(() => {
      this.performSearch();
    });
  }

  debouncedSearch(): Observable<any> {
    return of('').pipe(debounceTime(300));
  }

  clearSearch(): void {
    this.bookSearch.reset();
    this.searchResults = [];
    this.currentPage = 1;
    this.totalResults = 0;
  }

  goToNextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.performSearch();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.performSearch();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalResults / this.pageSize);
  }
}
