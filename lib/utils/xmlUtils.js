// xmlUtils.js
// Using a lightweight XML parser that works in React Native/Expo
// No dependencies on Node.js core modules

/**
 * A simple XML parser for React Native/Expo that handles basic XML needs
 * without dependency on problematic libraries
 */
class SimpleXMLParser {
    // Parse XML string to object
    static parse(xmlString) {
      // Helper function to extract attributes
      const getAttributes = (element) => {
        const attrs = {};
        if (element.attributes && element.attributes.length > 0) {
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attrs[attr.name] = attr.value;
          }
        }
        return attrs;
      };
  
      // Helper function to process an element and its children
      const processElement = (element) => {
        // Create result object
        const result = {};
        
        // Add attributes
        const attributes = getAttributes(element);
        if (Object.keys(attributes).length > 0) {
          result['$'] = attributes;
        }
        
        // Process child elements
        const childElements = {};
        
        for (let i = 0; i < element.childNodes.length; i++) {
          const child = element.childNodes[i];
          
          // Handle text nodes
          if (child.nodeType === 3) { // Text node
            const text = child.nodeValue.trim();
            if (text) {
              result['_'] = text;
            }
            continue;
          }
          
          // Skip non-element nodes
          if (child.nodeType !== 1) continue; // Not an element
          
          const childTagName = child.nodeName;
          const childData = processElement(child);
          
          // Handle multiple elements with the same tag
          if (childElements[childTagName]) {
            if (!Array.isArray(childElements[childTagName])) {
              childElements[childTagName] = [childElements[childTagName]];
            }
            childElements[childTagName].push(childData);
          } else {
            childElements[childTagName] = childData;
          }
        }
        
        // Add child elements to result
        Object.assign(result, childElements);
        
        return result;
      };
  
      try {
        // Parse XML string using DOMParser (available in React Native)
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");
        
        // Get the root element and process it
        const rootElement = xmlDoc.documentElement;
        const result = {};
        result[rootElement.nodeName] = processElement(rootElement);
        
        return result;
      } catch (error) {
        console.error("XML parsing error:", error);
        throw error;
      }
    }
  
    // Convert object to XML string
    static stringify(obj) {
      // Helper function to convert an object to XML
      const toXML = (obj, name) => {
        let xml = `<${name}`;
        
        // Add attributes
        if (obj['$']) {
          Object.keys(obj['$']).forEach(attr => {
            xml += ` ${attr}="${obj['$'][attr]}"`;
          });
        }
        
        // Check if it's an empty element
        const hasContent = Object.keys(obj).some(key => key !== '$');
        
        if (!hasContent) {
          xml += ' />';
          return xml;
        }
        
        xml += '>';
        
        // Add text content
        if (obj['_']) {
          xml += obj['_'];
        }
        
        // Add child elements
        Object.keys(obj).forEach(key => {
          if (key !== '$' && key !== '_') {
            const value = obj[key];
            
            if (Array.isArray(value)) {
              // Handle arrays of elements
              value.forEach(item => {
                xml += toXML(item, key);
              });
            } else if (typeof value === 'object') {
              // Handle single child element
              xml += toXML(value, key);
            }
          }
        });
        
        xml += `</${name}>`;
        return xml;
      };
      
      // Get the root element name and convert
      const rootName = Object.keys(obj)[0];
      return toXML(obj[rootName], rootName);
    }
  }
  
  /**
   * Parse XML string to JavaScript object
   * @param {string} xmlString - The XML string to parse
   * @returns {Promise<Object>} Parsed JavaScript object
   */
  export const parseXML = (xmlString) => {
    return new Promise((resolve, reject) => {
      try {
        const result = SimpleXMLParser.parse(xmlString);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  };
  
  /**
   * Convert JavaScript object to XML string
   * @param {Object} jsObject - JavaScript object to convert
   * @returns {string} XML string
   */
  export const buildXML = (jsObject) => {
    try {
      return SimpleXMLParser.stringify(jsObject);
    } catch (error) {
      console.error("Error building XML:", error);
      throw error;
    }
  };
  
  /**
   * Parse restaurant menu XML
   * @param {string} xmlString - XML string of restaurant menu
   * @returns {Promise<Object>} Parsed menu object
   */
  export const parseMenuXML = async (xmlString) => {
    try {
      const result = await parseXML(xmlString);
  
      if (!result || !result.menu) {
        throw new Error("Invalid menu XML format");
      }
  
      const { menu } = result;
  
      // Format the data to match the expected structure
      const formattedMenu = {
        date: menu.$.date, // Extract the date attribute
        meals: {},
      };
  
      // Process meals
      if (menu.meals) {
        // Process breakfast
        if (menu.meals.breakfast) {
          formattedMenu.meals.breakfast = {};
  
          if (
            menu.meals.breakfast.mainDishes &&
            menu.meals.breakfast.mainDishes.dish
          ) {
            formattedMenu.meals.breakfast.mainDishes = Array.isArray(
              menu.meals.breakfast.mainDishes.dish
            )
              ? menu.meals.breakfast.mainDishes.dish
              : [menu.meals.breakfast.mainDishes.dish];
          }
  
          if (menu.meals.breakfast.sides && menu.meals.breakfast.sides.dish) {
            formattedMenu.meals.breakfast.sides = Array.isArray(
              menu.meals.breakfast.sides.dish
            )
              ? menu.meals.breakfast.sides.dish
              : [menu.meals.breakfast.sides.dish];
          }
  
          if (menu.meals.breakfast.drinks && menu.meals.breakfast.drinks.drink) {
            formattedMenu.meals.breakfast.drinks = Array.isArray(
              menu.meals.breakfast.drinks.drink
            )
              ? menu.meals.breakfast.drinks.drink
              : [menu.meals.breakfast.drinks.drink];
          }
        }
  
        // Process lunch
        if (menu.meals.lunch) {
          formattedMenu.meals.lunch = {};
  
          if (menu.meals.lunch.mainDishes && menu.meals.lunch.mainDishes.dish) {
            formattedMenu.meals.lunch.mainDishes = Array.isArray(
              menu.meals.lunch.mainDishes.dish
            )
              ? menu.meals.lunch.mainDishes.dish
              : [menu.meals.lunch.mainDishes.dish];
          }
  
          if (menu.meals.lunch.sides && menu.meals.lunch.sides.dish) {
            formattedMenu.meals.lunch.sides = Array.isArray(
              menu.meals.lunch.sides.dish
            )
              ? menu.meals.lunch.sides.dish
              : [menu.meals.lunch.sides.dish];
          }
  
          if (menu.meals.lunch.desserts && menu.meals.lunch.desserts.dish) {
            formattedMenu.meals.lunch.desserts = Array.isArray(
              menu.meals.lunch.desserts.dish
            )
              ? menu.meals.lunch.desserts.dish
              : [menu.meals.lunch.desserts.dish];
          }
        }
  
        // Process dinner
        if (menu.meals.dinner) {
          formattedMenu.meals.dinner = {};
  
          if (menu.meals.dinner.mainDishes && menu.meals.dinner.mainDishes.dish) {
            formattedMenu.meals.dinner.mainDishes = Array.isArray(
              menu.meals.dinner.mainDishes.dish
            )
              ? menu.meals.dinner.mainDishes.dish
              : [menu.meals.dinner.mainDishes.dish];
          }
  
          if (menu.meals.dinner.sides && menu.meals.dinner.sides.dish) {
            formattedMenu.meals.dinner.sides = Array.isArray(
              menu.meals.dinner.sides.dish
            )
              ? menu.meals.dinner.sides.dish
              : [menu.meals.dinner.sides.dish];
          }
  
          if (menu.meals.dinner.desserts && menu.meals.dinner.desserts.dish) {
            formattedMenu.meals.dinner.desserts = Array.isArray(
              menu.meals.dinner.desserts.dish
            )
              ? menu.meals.dinner.desserts.dish
              : [menu.meals.dinner.desserts.dish];
          }
        }
      }
  
      return formattedMenu;
    } catch (error) {
      console.error("Error parsing menu XML:", error);
      throw error;
    }
  };
  
  /**
   * Parse swimming pool hours XML
   * @param {string} xmlString - XML string of pool hours
   * @returns {Promise<Object>} Parsed pool hours object
   */
  export const parsePoolHoursXML = async (xmlString) => {
    try {
      const result = await parseXML(xmlString);
  
      if (!result || !result.poolHours) {
        throw new Error("Invalid pool hours XML format");
      }
  
      const { poolHours } = result;
  
      // Format the data to match the expected structure
      const formattedHours = {
        lastUpdated: poolHours.$.lastUpdated, // Extract the lastUpdated attribute
        weekdays: {},
        weekend: {},
        specialHours: [],
      };
  
      // Process weekdays
      if (poolHours.weekdays && poolHours.weekdays.session) {
        const sessions = Array.isArray(poolHours.weekdays.session)
          ? poolHours.weekdays.session
          : [poolHours.weekdays.session];
  
        sessions.forEach((session) => {
          const type = session.$.type; // Extract the type attribute
          formattedHours.weekdays[type + "Session"] = session.$.hours; // Extract the hours attribute
        });
      }
  
      // Process weekend
      if (poolHours.weekend && poolHours.weekend.session) {
        const sessions = Array.isArray(poolHours.weekend.session)
          ? poolHours.weekend.session
          : [poolHours.weekend.session];
  
        sessions.forEach((session) => {
          const type = session.$.type; // Extract the type attribute
          formattedHours.weekend[type + "Session"] = session.$.hours; // Extract the hours attribute
        });
      }
  
      // Process special hours
      if (poolHours.specialHours && poolHours.specialHours.day) {
        const days = Array.isArray(poolHours.specialHours.day)
          ? poolHours.specialHours.day
          : [poolHours.specialHours.day];
  
        days.forEach((day) => {
          formattedHours.specialHours.push({
            date: day.$.date, // Extract the date attribute
            reason: day.$.reason, // Extract the reason attribute
            hours: day.$.hours, // Extract the hours attribute
          });
        });
      }
  
      return formattedHours;
    } catch (error) {
      console.error("Error parsing pool hours XML:", error);
      throw error;
    }
  };
  
  /**
   * Handle XML parsing based on content type
   * @param {string} xmlString - XML string to parse
   * @param {string} contentType - Type of content (menu, poolHours)
   * @returns {Promise<Object>} Parsed object
   */
  export const handleXMLContent = async (xmlString, contentType) => {
    try {
      switch (contentType) {
        case "menu":
          return await parseMenuXML(xmlString);
        case "poolHours":
          return await parsePoolHoursXML(xmlString);
        default:
          // Generic parsing for other XML types
          return await parseXML(xmlString);
      }
    } catch (error) {
      console.error(`Error handling XML content (${contentType}):`, error);
      throw error;
    }
  };
  
  export default { parseXML, buildXML, parseMenuXML, parsePoolHoursXML, handleXMLContent };