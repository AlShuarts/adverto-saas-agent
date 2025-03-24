
/**
 * Utility functions to extract pagination information from Centris broker profile pages
 */

/**
 * Extract total pages from HTML
 */
export function extractTotalPages(html: string): number {
  if (!html || typeof html !== 'string') {
    return 1;
  }
  
  try {
    // Try multiple patterns to extract total pages
    
    // Pattern 1: "Page X de Y"
    const paginationRegex = /(?:Page|page)\s+\d+\s+(?:de|of|sur|on)\s+(\d+)/i;
    const match = html.match(paginationRegex);
    
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    
    // Pattern 2: Look for highest numbered page link
    const pageLinks = html.match(/class="(?:page-link|pagination-item)[^"]*"[^>]*>(\d+)<\/a>/g);
    if (pageLinks && pageLinks.length > 0) {
      const pageNumbers = pageLinks.map(link => {
        const match = link.match(/>(\d+)</);
        return match ? parseInt(match[1], 10) : 0;
      });
      return Math.max(...pageNumbers);
    }
    
    // Pattern 3: Count pagination items
    const paginationItems = (html.match(/class="(?:page-item|pagination-item)"/g) || []).length;
    if (paginationItems > 0) {
      // Subtract items for prev/next buttons
      return Math.max(1, paginationItems - 2);
    }
  } catch (error) {
    console.error('Error while extracting total pages:', error);
  }
  
  return 1; // Default to 1 if we can't determine the total pages
}

/**
 * Check if there are more pages based on pagination links
 */
export function hasNextPage(html: string, currentPage: number): boolean {
  if (!html || typeof html !== 'string') {
    return false;
  }
  
  try {
    // Check if there are more pages by looking for pagination links
    const hasNextPageLink = html.includes('class="pager-next"') || 
                        html.includes('class="next"') ||
                        html.includes('class="pagination-item_next"');
    
    const totalPages = extractTotalPages(html);
    
    return hasNextPageLink || (totalPages > currentPage);
  } catch (error) {
    console.error('Error checking for next page:', error);
    return false;
  }
}

/**
 * Extract the property count from HTML
 */
export function extractPropertyCount(html: string): number | null {
  if (!html || typeof html !== 'string') {
    return null;
  }
  
  try {
    const propertyCountMatch = html.match(/(\d+)\s*(?:propriété|propriétés|property|properties)/i);
    if (propertyCountMatch) {
      return parseInt(propertyCountMatch[1], 10);
    }
  } catch (error) {
    console.error('Error extracting property count:', error);
  }
  
  return null;
}
