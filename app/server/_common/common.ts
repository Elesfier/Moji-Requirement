
export const MAX_FILE_SIZE_UPLOAD: number = 1976563;

export function generateRandomString (): string
{
  return Math.random().toString(36).substring(7);
}

export function changeToLowerCase(str: string): string {
  let newStr: string = "";
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 65 && code < 91) {
      newStr += str.charAt(i).toLowerCase();
    }
    else {
      newStr += str.charAt(i);
    }
  }
  return newStr;
}