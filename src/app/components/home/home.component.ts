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
  // Array to store the search results
  //apiUrl = 'https://openlibrary.org/search.json?title=';

  constructor(private http: HttpClient) {
    this.bookSearch = new FormControl('');
  }

  //private cache$: ReplaySubject<any> = new ReplaySubject<any>(1);

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
    // Replace the URL with your actual API endpoint for searching books
    const apiUrl = `https://openlibrary.org/dev/docs/api/search`;

    return this.http.get(apiUrl);
  }

  // performSearch() {
  //   const searchText = this.bookSearch.value;

  //   if (searchText) {
  //     const searchUrl = this.apiUrl + searchText;

  //     this.http.get(searchUrl).subscribe((response: any) => {
  //       this.searchResults = response.docs;
  //     });
  //   }
  // }

  performSearch(): void {
    const apiUrl = `https://openlibrary.org/search.json?q=${this.bookSearch.value}&limit=${this.pageSize}&offset=${(this.currentPage - 1) * this.pageSize}`;
    this.http.get(apiUrl).subscribe((response: any) => {
      this.searchResults = response.docs;
      this.totalResults = response.num_found;
    });
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

  // clearSearch(): void {
  //   this.bookSearch.reset();// Reset the FormControl value to clear the search input field
  //   this.searchResults = [];
  // }
}
